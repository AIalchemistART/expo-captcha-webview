import * as Sentry from 'sentry-expo';
import React, { useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import JournalTabs from '../components/JournalTabs';
import NotesEditor from '../components/NotesEditor';
import BookmarkEditor from '../components/BookmarkEditor';
import SortableNotesList from '../components/SortableNotesList';
import GlobalNoteModal from '../components/GlobalNoteModal';
import BookmarkSortDropdown from '../components/BookmarkSortDropdown';
import BookmarkModal from '../components/BookmarkModal';

// const DEV_MODE = true;
// const DEV_NOTES = [];
// Bookmarks state for Journal
import { fetchBookmarks, addBookmark } from '../services/bookmarks';



import JournalLoadingSpinner from '../components/JournalLoadingSpinner';
import { useRef, useEffect } from 'react';
import JournalIntroOverlay from '../components/JournalIntroOverlay';
import { useAuth } from '../auth/useAuth';
import { useProfile } from '../auth/ProfileProvider';
import { fetchNotes, addNote, updateNote, deleteNote } from '../services/notes';

const JournalScreen = ({ navigation }) => {
  // Auth and profile
  const { user } = useAuth();
  const { profile } = useProfile();
  const isAuthenticated = !!user;
  const isPremium = !!profile?.is_paid;

  // Journal Intro Overlay state
  const [showJournalIntro, setShowJournalIntro] = useState(false);

  // Show overlay only for unauthenticated or authenticated free users, and only if not dismissed
  useEffect(() => {
    let mounted = true;
    const checkDismissed = async () => {
      if (isPremium) {
        if (mounted) setShowJournalIntro(false);
        return;
      }
      const val = await AsyncStorage.getItem('mbc_journal_intro_dismissed_v1');
      if (mounted) setShowJournalIntro(val !== 'true');
    };
    checkDismissed();
    return () => { mounted = false; };
  }, [isPremium]);

  // Handlers for overlay actions
  const handleSignIn = () => {
    setShowJournalIntro(false);
    navigation.navigate('Premium');
  };
  const handleUpgrade = () => {
    setShowJournalIntro(false);
    navigation.navigate('Premium');
  };
  const handleDismissIntro = () => {
    setShowJournalIntro(false);
  };

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [bookmarksError, setBookmarksError] = useState(null);
  const [bookmarkSortKey, setBookmarkSortKey] = useState('created_desc');

  // Helper: get anchor string for sorting
  function bookmarkAnchorKey(bm) {
    const a = bm.anchor || {};
    const book = a.book || bm.book || '';
    const chapter = a.chapter || bm.chapter || '';
    const start = a.startVerse || bm.start_verse || '';
    const end = a.endVerse || bm.end_verse || '';
    let s = book;
    if (chapter) s += ` ${chapter}`;
    if (start) s += `:${start}`;
    if (end) s += `–${end}`;
    return s;
  }

  // Sorting logic
  const sortedBookmarks = React.useMemo(() => {
    if (bookmarkSortKey === 'created_desc') {
      return [...bookmarks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (bookmarkSortKey === 'created_asc') {
      return [...bookmarks].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (bookmarkSortKey === 'alpha_asc') {
      return [...bookmarks].sort((a, b) => bookmarkAnchorKey(a).localeCompare(bookmarkAnchorKey(b)));
    } else if (bookmarkSortKey === 'alpha_desc') {
      return [...bookmarks].sort((a, b) => bookmarkAnchorKey(b).localeCompare(bookmarkAnchorKey(a)));
    }
    return bookmarks;
  }, [bookmarks, bookmarkSortKey]);

  // Fetch bookmarks on mount
  useEffect(() => {
    let mounted = true;
    setBookmarksLoading(true);
    fetchBookmarks()
      .then(data => { if (mounted) { setBookmarks(data); setBookmarksError(null); } })
      .catch(err => { if (mounted) setBookmarksError(err.message || 'Failed to load bookmarks'); })
      .finally(() => { if (mounted) setBookmarksLoading(false); });
    return () => { mounted = false; };
  }, []);

  const [activeTab, setActiveTab] = useState('bookmarks');
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [bookmarkEditMode, setBookmarkEditMode] = useState(false);
  const [bookmarkModalLoading, setBookmarkModalLoading] = useState(false);

  // Notes & Modal state lifted here
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showModalComponent, setShowModalComponent] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [pendingNote, setPendingNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalInstanceKey, setModalInstanceKey] = useState(0);
  const isClosing = useRef(false);

  // Fetch notes on mount
  useEffect(() => {
    let mounted = true;
    setNotesLoading(true);
    fetchNotes()
      .then(data => { if(mounted) { setNotes(data); setNotesError(null); } })
      .catch(err => { if(mounted) setNotesError(err.message || 'Failed to load notes'); })
      .finally(() => { if(mounted) setNotesLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Add note handler
  const handleAddNote = async (note, selection) => {
    try {
      const newNote = await addNote(note, selection);
      setNotes(prev => [newNote, ...prev]);
    } catch (err) {
      setNotesError(err.message || 'Failed to add note');
      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  };

  // Edit note handler
  const handleEditSave = async (note, selection) => {
    if (!selectedNote || !selectedNote.id) return;
    try {
      const updated = await updateNote(selectedNote.id, note, selection);
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      closeModal();
    } catch (err) {
      setNotesError(err.message || 'Failed to update note');
      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  };

  // Delete note handler
  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      closeModal(); // Close overlay after delete
    } catch (err) {
      setNotesError(err.message || 'Failed to delete note');
      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
        Sentry.captureException(err);
      }
    }
  };

  // Modal handlers
  // Open note modal, queue if modal is still closing
  const openNoteModal = (noteObj) => {
    // [PRODUCTION] Commented out for production safety. Enable only for debugging.
// console.trace();
    if (modalVisible || isClosing.current || showModalComponent) {
      setPendingNote(noteObj);
      return;
    }
    setModalInstanceKey(k => k + 1);
    setSelectedNote(noteObj);
    setIsEditing(false);
    setShowModalComponent(true);
    setTimeout(() => {
      setModalVisible(true);
    }, 10);
  };
  // Close modal, but only clear state in onDismiss
  const closeModal = () => {
    // [PRODUCTION] Commented out for production safety. Enable only for debugging.
// console.trace();
    if (!modalVisible) {
      return;
    }
    setModalInstanceKey(k => k + 1);
    isClosing.current = true;
    setModalVisible(false);
    setIsEditing(false);
    setTimeout(() => {
      setShowModalComponent(false);
      isClosing.current = false;
    }, 350); // Allow animation to finish before unmount
  };

  // Fix: After drag/drop, forcibly close modal if open (prevents unresponsive overlay) and always increment modalKey
  React.useEffect(() => {
    if (modalVisible) {
      const noteTimestamps = notes.map(n => n.timestamp).join(',');
      if (openNoteModal._lastNoteTimestamps && openNoteModal._lastNoteTimestamps !== noteTimestamps) {
        closeModal();
        setModalKey(k => k + 1);
      }
      openNoteModal._lastNoteTimestamps = noteTimestamps;
    }
  }, [notes, modalVisible]);
  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Journal Intro Overlay: Only for unauthenticated or free users */}
      <JournalIntroOverlay
        visible={showJournalIntro}
        onDismiss={handleDismissIntro}
        isAuthenticated={isAuthenticated}
        isPremium={isPremium}
        onSignIn={handleSignIn}
        onUpgrade={handleUpgrade}
      />
      {isClosing.current && <JournalLoadingSpinner message="Closing..." />}

      {showModalComponent && (
        <GlobalNoteModal
          modalInstanceKey={modalInstanceKey}
          modalVisible={modalVisible}
          selectedNote={selectedNote}
          isEditing={isEditing}
          onClose={closeModal}
          onEdit={() => setIsEditing(true)}
          onEditSave={handleEditSave}
          onDismiss={() => {
            setShowModalComponent(false);
            setSelectedNote(null);
            setIsEditing(false);
          }}
          onDelete={selectedNote && !isEditing ? handleDeleteNote : undefined}
        />
      )}
      <MysticalHomeBackground />
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <View style={{ flex: 1, width: '100%', flexDirection: 'column' }}>
        <View style={styles.tabsAnchor}>
          <JournalTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          {activeTab === 'bookmarks' ? (
            <View style={{ width: '100%', flex: 1 }}>
              {bookmarksLoading ? (
                <JournalLoadingSpinner message="Loading bookmarks..." />
              ) : bookmarksError ? (
                <Text style={styles.subtitle}>{bookmarksError}</Text>
              ) : selectedBookmark ? (
                <BookmarkEditor
                  commentary={selectedBookmark.commentary}
                  anchor={selectedBookmark.anchor || {
                    book: selectedBookmark.book,
                    chapter: selectedBookmark.chapter,
                    startVerse: selectedBookmark.start_verse,
                    endVerse: selectedBookmark.end_verse
                  }}
                  initialNote={selectedBookmark.note}
                  onSave={async (note) => {
                    // Update the note for this bookmark in Supabase
                    try {
                      await addBookmark(
                        selectedBookmark.anchor || null,
                        selectedBookmark.commentary_id || null,
                        note,
                        false,
                        {
                          book: selectedBookmark.book,
                          chapter: selectedBookmark.chapter,
                          startVerse: selectedBookmark.start_verse,
                          endVerse: selectedBookmark.end_verse
                        },
                        selectedBookmark.commentary
                      );
                      // Refetch bookmarks and update state
                      const updated = await fetchBookmarks();
                      setBookmarks(updated);
                      setSelectedBookmark(null);
                    } catch (err) {
                      alert('Failed to save note: ' + (err.message || err));
                    }
                  }}
                />
              ) : (
                <>
                  <BookmarkSortDropdown sortKey={bookmarkSortKey} setSortKey={setBookmarkSortKey} />
                  <ScrollView style={{ marginTop: 8 }}>
                    {sortedBookmarks.length === 0 ? (
                      isAuthenticated && !isPremium ? (
                        <Text style={styles.subtitle}>Bookmarks are a premium feature. Please upgrade to premium to save bookmarks.</Text>
                      ) : (
                        <Text style={styles.subtitle}>No bookmarks yet.</Text>
                      )
                    ) : (
                      sortedBookmarks.map(bm => (
                        <TouchableOpacity
                          key={bm.id}
                          style={styles.noteCard}
                          onPress={() => {
                            setSelectedBookmark(bm);
                            setBookmarkModalVisible(true);
                            setBookmarkEditMode(false);
                          }}
                          activeOpacity={0.88}
                        >
                          <Text style={styles.anchor}>
                            {(() => {
                              const book = bm.anchor?.book || bm.book || '';
                              const chapter = bm.anchor?.chapter || bm.chapter || '';
                              const start = bm.anchor?.startVerse || bm.start_verse || '';
                              const end = bm.anchor?.endVerse || bm.end_verse || '';
                              let ref = `${book} ${chapter}`;
                              if (start) {
                                ref += `:${start}`;
                              }
                              if (end && end !== start) {
                                ref += `-${end}`;
                              }
                              const anchorVerse = bm.anchor?.anchorVerse;
                              if (anchorVerse) {
                                ref += `  (Focus: ${anchorVerse})`;
                              }
                              return ref;
                            })()}
                          </Text>
                          <Text style={styles.noteText}>{bm.commentary}</Text>
                          {bm.note ? (
                            <>
                              <Text style={styles.anchor}>Your Note</Text>
                              <Text style={styles.noteText}>{bm.note}</Text>
                            </>
                          ) : null}
                          {bm.created_at && (
                            <Text style={styles.timestamp}>{new Date(bm.created_at).toLocaleString()}</Text>
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </>
              )}
              <BookmarkModal
                visible={bookmarkModalVisible}
                bookmark={selectedBookmark}
                isEditing={bookmarkEditMode}
                loading={bookmarkModalLoading}
                onClose={() => {
                  setBookmarkModalVisible(false);
                  setTimeout(() => setSelectedBookmark(null), 300);
                }}
                onEdit={() => setBookmarkEditMode(true)}
                onEditSave={async (note) => {
                  if (!selectedBookmark) return;
                  setBookmarkModalLoading(true);
                  try {
                    await addBookmark(
                      selectedBookmark.anchor || null,
                      selectedBookmark.commentary_id || null,
                      note,
                      false,
                      {
                        book: selectedBookmark.book,
                        chapter: selectedBookmark.chapter,
                        startVerse: selectedBookmark.start_verse,
                        endVerse: selectedBookmark.end_verse
                      },
                      selectedBookmark.commentary
                    );
                    // Refetch bookmarks and update state
                    const updated = await fetchBookmarks();
                    setBookmarks(updated);
                    // Update selectedBookmark
                    const newSel = updated.find(b => b.id === selectedBookmark.id);
                    setSelectedBookmark(newSel || null);
                    setBookmarkEditMode(false);
                  } catch (err) {
                    alert('Failed to save note: ' + (err.message || err));
                  } finally {
                    setBookmarkModalLoading(false);
                  }
                }}
                onRemove={async (id) => {
                  setBookmarkModalLoading(true);
                  try {
                    const { deleteBookmark, fetchBookmarks } = await import('../services/bookmarks');
                    await deleteBookmark(id);
                    const updated = await fetchBookmarks();
                    setBookmarks(updated);
                    setBookmarkModalVisible(false);
                    setTimeout(() => setSelectedBookmark(null), 300);
                  } catch (err) {
                    alert('Failed to remove bookmark: ' + (err.message || err));
                  } finally {
                    setBookmarkModalLoading(false);
                  }
                }}
              />
            </View>
          ) : (
            <SortableNotesList
              notes={notes}
              setNotes={setNotes}
              openNoteModal={openNoteModal}
              onAddNote={handleAddNote}
              onEditNote={handleEditSave}
              onDeleteNote={handleDeleteNote}
              notesLoading={notesLoading}
              notesError={notesError}
              navigation={navigation}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  tabsAnchor: {
    marginTop: 0,
    marginBottom: 6,
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    zIndex: 12,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A004B', // Dark mystical purple
  },
  noteCard: {
    backgroundColor: '#fffbe6', // parchment-like, high contrast
    borderRadius: 16,
    marginBottom: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    width: '96%',
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1b866', // gold accent
    elevation: 4,
  },
  anchor: {
    color: '#2A004B',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  noteText: {
    color: '#20003a', // deep mystical purple, high contrast
    fontSize: 18,
    fontFamily: 'serif',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  timestamp: {
    color: '#bfae66',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'gold',
    fontFamily: 'serif',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffe066', // Soft gold
    fontFamily: 'serif',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default JournalScreen;
