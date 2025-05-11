import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import { fetchSacredSounds } from '../services/sacredSoundsService';
import SacredSoundOverlay from '../components/SacredSoundOverlay';
import SacredSoundsPremiumOverlay from '../components/SacredSoundsPremiumOverlay';
import SacredSoundsSessionReminderOverlay from '../components/SacredSoundsSessionReminderOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DownloadInfoOverlay from '../components/DownloadInfoOverlay';
import { shareFileAsync } from '../utils/shareFile';
import bible from '../utils/web_bible.json';

const SUNO_ATTRIBUTION = 'Created with Suno AI';

// Helper: Remove trailing (1) and .mp3 from file name
function getSongTitleFromUrl(url) {
  const fileName = decodeURIComponent(url.split('/').pop());
  const noExt = fileName.replace(/\.mp3$/i, '');
  return noExt.replace(/\s*\(\d+\)$/, '');
}

const PAGE_SIZE = 20;

import { useAuth } from '../auth/useAuth';
import { useProfile } from '../auth/ProfileProvider';

const SACRED_SOUNDS_OVERLAY_KEY = 'mbc_sacred_sounds_overlay_dismissed_v1';

const SacredSoundsScreen = ({ navigation }) => {
  // ...existing state
  // (leave as is)

  const { user, signIn } = useAuth();
  const { isPremium, upgradeToPremium } = useProfile();
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false);

  // Session reminder state
  const [showSessionReminder, setShowSessionReminder] = useState(false);
  const sessionReminderShown = useRef(false);

  // Reset session reminder flag every time screen is focused (navigation entry)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      sessionReminderShown.current = false;
      setShowPremiumOverlay(false); // Always reset overlay on focus
    });
    return unsubscribe;
  }, [navigation]);

  // Function to trigger the session reminder overlay from button(s)
  const triggerSessionReminder = () => {
    if (isPremium) return;
    if (!sessionReminderShown.current) {
      setShowSessionReminder(true);
      sessionReminderShown.current = true;
    }
  };

  // Show overlay on first mount unless dismissed or user is premium
  useEffect(() => {
    // Only show overlay for non-premium users
    if (isPremium) {
      setShowPremiumOverlay(false);
      return;
    }
    AsyncStorage.getItem(SACRED_SOUNDS_OVERLAY_KEY).then(val => {
      if (val !== 'true') setShowPremiumOverlay(true);
    });
  }, [isPremium]);
  const [showDownloadInfo, setShowDownloadInfo] = useState(false);
  const [lastDownloadedUri, setLastDownloadedUri] = useState(null);

  // Find latest mp3 file in storage
  const updateLastDownloadedUri = async () => {
    try {
      const dirFiles = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const mp3s = dirFiles.filter(f => f.endsWith('.mp3'));
      if (mp3s.length === 0) {
        setLastDownloadedUri(null);
        return;
      }
      // Get file info for all mp3s
      const mp3Infos = await Promise.all(mp3s.map(async f => {
        const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + f);
        return {uri: FileSystem.documentDirectory + f, mtime: info.modificationTime};
      }));
      // Sort by modification time, descending
      mp3Infos.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
      setLastDownloadedUri(mp3Infos[0].uri);
    } catch (e) {
      setLastDownloadedUri(null);
    }
  };

  // Update on mount and after downloads/clear
  useEffect(() => { updateLastDownloadedUri(); }, []);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const isLoadingSound = useRef(false);
  // Enable background audio playback
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    });
    // Cleanup: always unload sound on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  // Playlist state
  const [tracks, setTracks] = useState([]); // [{ id, title, artist, lyrics, s3Url, metadata }]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const soundRef = useRef(null);

  // Pagination state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Shuffle playlist on mount
  useEffect(() => {
    async function loadTracks(pageToLoad = 0) {
      if (pageToLoad === 0) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);
      try {
        const tracksFromDb = await fetchSacredSounds({ limit: PAGE_SIZE, offset: pageToLoad * PAGE_SIZE });
        if (!tracksFromDb.length) {
          if (pageToLoad === 0) throw new Error('No Sacred Sounds tracks found.');
          setHasMore(false);
          return;
        }
        // Shuffle the tracks for random order
        function shuffle(array) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        }
        let filteredTracks = tracksFromDb;
        // Premium gating: only show tracks marked isFreeSacredSound for non-premium users
        if (!isPremium) {
          filteredTracks = filteredTracks.filter(t => t.isFreeSacredSound);
        }
        const shuffledTracks = shuffle([...filteredTracks]);
        if (pageToLoad === 0) {
          setTracks(shuffledTracks);
          setCurrentIndex(0);
        } else {
          setTracks(prev => [...prev, ...shuffle([...filteredTracks])]);
        }
        setPage(pageToLoad);
        setHasMore(tracksFromDb.length === PAGE_SIZE);
      } catch (e) {
        console.error('[SacredSoundsScreen] Error loading tracks:', e);
        setError('Failed to load tracks.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
    loadTracks(0);
    return () => { if (soundRef.current) soundRef.current.unloadAsync(); };
  }, []);

  // Prefetch next page when user nears end
  const handleEndReached = () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    loadTracks(page + 1);
  };

  // Play current track
  // Debounced playTrack
  const playTrack = async (index) => {
    if (isLoadingSound.current) return;
    isLoadingSound.current = true;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: tracks[index].s3Url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setCurrentIndex(index);
    } catch (e) {
      setError('Playback error.');
      setIsPlaying(false);
    } finally {
      isLoadingSound.current = false;
    }
  };

  // Playback status
  const onPlaybackStatusUpdate = (status) => {
    // Auto-next: when a track finishes, play the next track automatically
    if (status.didJustFinish) {
      handleNext();
    }
  };

  // Controls
  // Debounce play/pause
  const handlePlayPause = () => {
    if (!tracks.length || isLoadingSound.current) return;
    if (isPlaying) {
      soundRef.current && soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      if (soundRef.current) {
        soundRef.current.playAsync();
        setIsPlaying(true);
      } else {
        playTrack(currentIndex);
      }
    }
  };
  const handleNext = () => {
    if (!tracks.length || isLoadingSound.current) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(nextIndex);
  };
  const handleBack = () => {
    if (!tracks.length || isLoadingSound.current) return;
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(prevIndex);
  };
  // Download
  // Download handler, now called after info overlay confirmation
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = tracks[currentIndex].s3Url;
      const filename = url.split('/').pop();
      const fileUri = FileSystem.documentDirectory + filename;
      // Check if file exists before downloading
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        Alert.alert('Already Downloaded', 'This track is already saved.');
        setIsDownloading(false);
        return;
      }
      // [PRODUCTION] Do not log download urls. Commented for production safety.
// console.log('[Download] url:', url);
      console.log('[Download] filename:', filename);
      console.log('[Download] fileUri:', fileUri);
      const result = await FileSystem.downloadAsync(url, fileUri);
      setLastDownloadedUri(fileUri);
      await updateLastDownloadedUri();
      console.log('[Download] result:', result);
      Alert.alert('Download Complete', `Saved to: ${fileUri}`);
      // Check for storage bloat (warn if >10 mp3s)
      const dirFiles = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const mp3s = dirFiles.filter(f => f.endsWith('.mp3'));
      if (mp3s.length > 10) {
        Alert.alert('Storage Warning', `You have ${mp3s.length} downloaded tracks. Consider clearing old downloads to save space.`);
      }
    } catch (e) {
      // [PRODUCTION] Route download errors to Sentry in production.
if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(e); }
// console.error('[Download] Error:', e);
      setError('Download failed.');
      Alert.alert('Download Failed', e.message || String(e));
    } finally {
      setIsDownloading(false);
    }
  };

  const track = tracks.length > 0 ? tracks[currentIndex] : null;
  const { inspirationVerse, passage } = useMemo(() => {
    let inspirationVerse = '';
    let passage = '';
    if (!track) return { inspirationVerse, passage };
    try {
      const bookObj = bible[track.metadata.book];
      if (!bookObj) throw new Error(`Book not found: ${track.metadata.book}`);
      const chapterObj = bookObj[track.metadata.chapter];
      if (!chapterObj) throw new Error(`Chapter not found: ${track.metadata.chapter}`);
      // Use anchorverse for the inspiration verse if present, fallback to startverse
      const anchor = parseInt(track.metadata.anchorverse || track.metadata.startverse, 10);
      let start = parseInt(track.metadata.startverse, 10);
      let end = parseInt(track.metadata.endverse, 10);
      if (start > end) [start, end] = [end, start];
      // Anchor verse
      if (chapterObj[anchor]) {
        inspirationVerse = `${anchor}: ${chapterObj[anchor]}`;
      }
      // Passage (all verses in range)
      let verses = [];
      for (let v = start; v <= end; v++) {
        if (chapterObj[v]) {
          verses.push(`${v}: ${chapterObj[v]}`);
        }
      }
      passage = verses.join('\n');
    } catch (e) {
      // Log but do not set state
      console.error('[SacredSoundsScreen] Error extracting verses:', e);
    }
    return { inspirationVerse, passage };
  }, [track, bible]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  }
  if (!tracks.length || !track) {
    return <View style={styles.center}><Text>No tracks available.</Text></View>;
  }

  // Prepare overlay data
  const anchorVerseNum = track.metadata.anchorverse || track.metadata.startverse;
  const focusVerse = `${track.metadata.book} ${track.metadata.chapter}:${anchorVerseNum}`;
  const verseRange = `${track.metadata.book} ${track.metadata.chapter}:${track.metadata.startverse}` + (track.metadata.startverse !== track.metadata.endverse ? `-${track.metadata.endverse}` : '');

  // --- Main Render ---
  return (
    <View style={styles.container}>
      <MysticalHomeBackground />
      {/* Track Info */}
      <Text style={styles.title}>{track.title}</Text>
      <Text style={styles.artist}>{track.artist}</Text>
      <Text style={styles.meta}>
        {track.metadata.book} {track.metadata.chapter}:{track.metadata.startverse}
        {track.metadata.startverse !== track.metadata.endverse ? `-${track.metadata.endverse}` : ''}
        {' '} (Focus: {anchorVerseNum})
      </Text>
      <ScrollView style={[styles.commentaryScroll, {maxHeight: 320}]} contentContainerStyle={{paddingBottom: 8}} showsVerticalScrollIndicator={true}>
        <Text style={styles.commentary}>{track.metadata.commentary}</Text>
      </ScrollView>
      {/* Follow the Divine Word Button */}
      <TouchableOpacity
        style={styles.followDivineBtn}
        onPress={() => {
          console.log('[DEBUG SacredSounds] Track object:', JSON.stringify(track, null, 2));
          setOverlayVisible(true);
        }}
      >
        <Text style={styles.followDivineBtnText}>Follow the Divine Word</Text>
      </TouchableOpacity>
      {/* Suno Attribution */}
      <View style={styles.attribution}><Text style={styles.attributionText}>{SUNO_ATTRIBUTION}</Text></View>
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleBack}><Ionicons name="play-back" size={36} color="#fff" /></TouchableOpacity>
        <TouchableOpacity onPress={() => { handlePlayPause(); triggerSessionReminder(); }}>
          <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={48} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { handleNext(); triggerSessionReminder(); }}><Ionicons name="play-forward" size={36} color="#fff" /></TouchableOpacity>
      </View>
      {/* Download & Clear Downloads Side by Side */}
      <View style={styles.downloadRow}>
        <TouchableOpacity style={[styles.downloadBtn, {marginRight: 8, flex: 1}]} onPress={async () => {
          await handleDownload();
          setShowDownloadInfo(true);
          triggerSessionReminder();
        }} disabled={isDownloading}>
          <Ionicons name="download" size={24} color="#fff" />
          <Text style={styles.downloadText}>{isDownloading ? 'Downloading...' : 'Download mp3'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.downloadBtn, {flex: 1, opacity: lastDownloadedUri ? 1 : 0.5}]}
          onPress={() => lastDownloadedUri && clearDownloads(updateLastDownloadedUri)}
          disabled={!lastDownloadedUri}
        >
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.downloadText}>Clear Downloads</Text>
        </TouchableOpacity>
      </View>
      {/* Playlist (Optional: show track list) */}
      <FlatList
        data={tracks}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.trackItem, index === currentIndex && styles.trackItemActive]}
            onPress={() => {
              playTrack(index);
              triggerSessionReminder();
            }}>
            <Text style={[styles.trackTitle, index === currentIndex && styles.trackTitleActive]}>{item.title}</Text>
<Text style={{ color: index === currentIndex ? '#2A004B' : '#aaa', fontSize: 12, marginTop: 2 }}>
  {item.metadata.book} {item.metadata.chapter}:{item.metadata.anchorverse || item.metadata.startverse}
</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        horizontal={true}
        style={styles.playlist}
        initialNumToRender={10}
        onEndReachedThreshold={0.5}
        onEndReached={handleEndReached}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator size="large" color="#bfae66" style={{ margin: 16 }} /> : null}
        showsHorizontalScrollIndicator={false}
      />
      <SacredSoundsPremiumOverlay
        visible={showPremiumOverlay}
        onClose={() => setShowPremiumOverlay(false)}
        onSignIn={() => {
          setShowPremiumOverlay(false);
          navigation.navigate('Premium');
        }}
        onUpgrade={() => {
          setShowPremiumOverlay(false);
          setShowSessionReminder(false);
          navigation.navigate('Premium');
        }}
        isLoggedIn={!!user}
      />
      <SacredSoundOverlay
        visible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
        songTitle={track.title}
        focusVerse={focusVerse}
        inspirationVerse={inspirationVerse}
        verseRange={verseRange}
        passage={passage}
      />
      <DownloadInfoOverlay
        visible={showDownloadInfo}
        onClose={() => setShowDownloadInfo(false)}
        canShare={!!lastDownloadedUri}
        onShare={async () => {
          if (lastDownloadedUri) await shareFileAsync(lastDownloadedUri);
        }}
      />
      {!isPremium && (
  <SacredSoundsSessionReminderOverlay
    visible={showSessionReminder}
    onClose={() => setShowSessionReminder(false)}
    onSignIn={() => {
      setShowSessionReminder(false);
      navigation.navigate('Premium');
    }}
    onUpgrade={() => {
      setShowSessionReminder(false);
      navigation.navigate('Premium');
    }}
    isLoggedIn={!!user}
  />
) }
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191825', alignItems: 'center', justifyContent: 'center', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginTop: 24 },
  artist: { fontSize: 16, color: '#aaa', marginBottom: 4 },
  meta: { fontSize: 14, color: '#aaa', marginBottom: 8 },
  commentary: { fontSize: 18, color: '#c9f', marginBottom: 16, fontStyle: 'italic', fontWeight: '500', lineHeight: 26 },
  commentaryScroll: { maxHeight: 260, width: '100%', marginBottom: 16, backgroundColor: 'rgba(60,30,90,0.10)', borderRadius: 8, paddingHorizontal: 8 },
  lyricsBox: { backgroundColor: '#282848', borderRadius: 10, padding: 16, marginBottom: 16, width: '100%' },
  lyrics: { fontSize: 16, color: '#fff', textAlign: 'center' },
  attribution: { marginBottom: 16 },
  attributionText: { fontSize: 12, color: '#FFB347', fontStyle: 'italic' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 0,
  },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#5A189A', borderRadius: 8, padding: 10 },

  downloadText: { color: '#fff', marginLeft: 8 },
  playlist: { marginTop: 8, maxHeight: 60 },
  trackItem: { padding: 8, marginHorizontal: 4, borderRadius: 6, backgroundColor: '#282848' },
  trackItemActive: { backgroundColor: '#FFD700' },
  trackTitle: { color: '#fff', fontSize: 14 },
  trackTitleActive: { color: '#2A004B' }, // branded dark purple

  error: { color: 'red', fontSize: 16 },
  followDivineBtn: {
    backgroundColor: '#374785',
    borderRadius: 22, // 18 * 1.2
    paddingVertical: 14, // 12 * 1.2
    paddingHorizontal: 29, // 24 * 1.2
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 7.2, // 6 * 1.2
    elevation: 2,
  },
  followDivineBtnText: {
    color: '#FFD700',
    fontSize: 20.4, // 17 * 1.2
    fontWeight: 'bold',
    letterSpacing: 0.6, // 0.5 * 1.2
  },
});

// Clear all downloaded mp3s
async function clearDownloads(updateLastDownloadedUri) {
  try {
    const dirFiles = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    const mp3s = dirFiles.filter(f => f.endsWith('.mp3'));
    console.log('[ClearDownloads] mp3s found:', mp3s);
    for (const file of mp3s) {
      try {
        await FileSystem.deleteAsync(FileSystem.documentDirectory + file, { idempotent: true });
      } catch (fileErr) {
        console.error(`[ClearDownloads] Error deleting ${file}:`, fileErr);
        throw fileErr;
      }
    }
    Alert.alert('Downloads Cleared', 'All downloaded tracks have been deleted.');
    await updateLastDownloadedUri();
  } catch (e) {
    console.error('[ClearDownloads] Error:', e);
    Alert.alert('Error', `Could not clear downloads. ${e.message || e}`);
  }
}

export default SacredSoundsScreen;


