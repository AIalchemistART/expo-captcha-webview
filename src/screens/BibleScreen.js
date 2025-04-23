import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Button, UIManager, findNodeHandle } from 'react-native';
import VignetteBackground from '../components/VignetteBackground';
import ScrollWornEdgesCommentary from '../components/ScrollWornEdgesCommentary';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import MysticalButtonBackground from '../components/MysticalButtonBackground';
import GoldBubbleBackground from '../components/GoldBubbleBackground';
import { Picker } from '@react-native-picker/picker';
import CustomPickerModal from '../components/CustomPickerModal';
import { BOOK_ABBREVIATIONS } from '../utils/bookAbbreviations';
import apiConfig from '../config/api';
import { useCommentary } from '../hooks/useCommentary';
import { BIBLE_STRUCTURE } from '../utils/bibleStructure';

import { getVerse, getChapter } from '../utils/bibleText';

// Debug log: Check Psalms 150 verse count from static structure
console.log('Psalms 150 verse count (should be 6):', BIBLE_STRUCTURE['Psalms'].verses[149]);
console.log('BibleScreen.js: Psalms last 5 values:', BIBLE_STRUCTURE['Psalms'].verses.slice(-5));
console.log('BibleScreen.js: Psalms verses length:', BIBLE_STRUCTURE['Psalms'].verses.length);

// Canonical and Apocryphal/Deuterocanonical book order for dropdown
const CANONICAL_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John',
  'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

// Apocryphal/Deuterocanonical books (grouped at end, Maccabees together, traditional order)
const APOCRYPHA_BOOKS = [
  'Tobit', 'Judith', 'Esther (Greek)', 'Wisdom of Solomon', 'Sirach', 'Baruch', 'Letter of Jeremiah',
  'Song of the Three Young Men', 'Susanna', 'Bel and the Dragon', 'Prayer of Manasseh',
  'Psalm 151', 'Odes', 'Psalms (Extra)', '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees', 'Ezra (Greek)'
];

// Filter for only present books (in case some are missing)
// Sectioned book list for dropdown with labels
const OLD_TESTAMENT = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
];
const NEW_TESTAMENT = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];
const APOCRYPHA = [
  'Tobit', 'Judith', 'Esther (Greek)', 'Wisdom of Solomon', 'Sirach', 'Baruch', 'Letter of Jeremiah',
  'Song of the Three Young Men', 'Susanna', 'Bel and the Dragon', 'Prayer of Manasseh',
  'Psalm 151', 'Odes', 'Psalms (Extra)', '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees', 'Ezra (Greek)'
];

const BOOKS = [
  { label: 'Old Testament', type: 'label' },
  ...OLD_TESTAMENT.filter(b => BIBLE_STRUCTURE[b]),
  { label: 'New Testament', type: 'label' },
  ...NEW_TESTAMENT.filter(b => BIBLE_STRUCTURE[b]),
  { label: 'Apocrypha & Deuterocanonical Books', type: 'label' },
  ...APOCRYPHA.filter(b => BIBLE_STRUCTURE[b])
];
// In your dropdown UI, render items with type === 'label' as section headers.


const BibleScreen = ({ navigation }) => {
  // 🟢 BibleScreen mounted
  useEffect(() => {
    console.log('🟢 [INTERNAL TEST 001][BibleScreen] Mounted');
  }, []);
  // Modal and commentary state
  const [showCommentaryModal, setShowCommentaryModal] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Set default book to 'Genesis' (first book of Old Testament)
  const [book, setBook] = useState('Genesis');
  const [showBookPickerModal, setShowBookPickerModal] = useState(false);

  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [showChapterPickerModal, setShowChapterPickerModal] = useState(false);
  const [showVersePickerModal, setShowVersePickerModal] = useState(false);
  // Passage selection state
  const [selectedRange, setSelectedRange] = useState(null); // {start: number, end: number} or null

  // Defensive: log if any are undefined
  if (book === undefined || chapter === undefined || verse === undefined) {
    console.error('[BibleScreen:FATAL] book, chapter, or verse is undefined', { book, chapter, verse });
  }

  // Determine passage range
  let startVerse = verse;
  let endVerse = verse;
  if (selectedRange) {
    startVerse = Math.min(selectedRange.start, selectedRange.end);
    endVerse = Math.max(selectedRange.start, selectedRange.end);
  }

  // Commentary fetch/caching (on-demand using useCommentary)
  const [commentaryRequested, setCommentaryRequested] = useState(false);
  // Only call the hook when commentary is requested
  const passageRange = selectedRange
    ? { startVerse: Math.min(selectedRange.start, selectedRange.end), endVerse: Math.max(selectedRange.start, selectedRange.end) }
    : { startVerse: verse, endVerse: verse };
  // [INTERNAL TEST] Standout log before calling useCommentary
  console.log('\x1b[33m\x1b[1m[INTERNAL TEST] useCommentary params:', {
    book: commentaryRequested ? book : null,
    chapter: commentaryRequested ? chapter : null,
    verse: commentaryRequested ? verse : null,
    passageRange: commentaryRequested ? passageRange : null
  }, '\x1b[0m');
  const {
    commentary,
    loading: commentaryLoading,
    error: commentaryError,
    refresh: refreshCommentary
  } = useCommentary(
    commentaryRequested ? book : null,
    commentaryRequested ? chapter : null,
    commentaryRequested ? verse : null,
    commentaryRequested ? passageRange : null
  );

  // Reset commentary state when modal closes or passage changes
  useEffect(() => {
    if (!showCommentaryModal) {
      console.log('\x1b[33m\x1b[1m[INTERNAL TEST] Commentary modal closed, resetting commentaryRequested.\x1b[0m');
      setCommentaryRequested(false);
    }
  }, [showCommentaryModal]);
  useEffect(() => {
    console.log('\x1b[33m\x1b[1m[INTERNAL TEST] Passage changed (book/chapter/verse/range), resetting commentaryRequested.\x1b[0m');
    setCommentaryRequested(false);
  }, [book, chapter, verse, selectedRange]);

  // Helper to display passage reference
  const passageReference = selectedRange && selectedRange.start !== selectedRange.end
    ? `${book} ${chapter}:${Math.min(selectedRange.start, selectedRange.end)}–${Math.max(selectedRange.start, selectedRange.end)}`
    : `${book} ${chapter}:${verse}`;


  // Set default book to 'Genesis' (first book of Old Testament)

  // Update chapter and verse when book or chapter changes
  useEffect(() => {
    setChapter(1);
    setVerse(1);
    setSelectedRange(null);
  }, [book]);
  useEffect(() => {
    setVerse(1);
    setSelectedRange(null);
  }, [chapter]);

  // Invalidate cache and commentary result on book/chapter/verse/range change
  useEffect(() => {
    setShowReasoning(false);
  }, [book, chapter, verse, selectedRange]);

  // Defensive: Only access book data if book is valid
  const bookData = BIBLE_STRUCTURE[book];
  const chapters = Array.from({ length: bookData?.chapters || 1 }, (_, i) => i + 1);
  const verseCount = bookData?.verses?.[chapter - 1] || 1;
  console.log('BibleScreen: book:', book, 'chapter:', chapter, 'verseCount:', verseCount);
  if (book === 'Psalms') {
    console.log('BibleScreen: Psalms verses length:', BIBLE_STRUCTURE['Psalms'].verses.length);
    console.log('BibleScreen: Psalms last 5:', BIBLE_STRUCTURE['Psalms'].verses.slice(-5));
    console.log('BibleScreen: Psalms[149]:', BIBLE_STRUCTURE['Psalms'].verses[149]);
  }
  const verses = Array.from({ length: verseCount }, (_, i) => i + 1);
  const [chapterVerses, setChapterVerses] = useState([]);
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedVerse, setHighlightedVerse] = useState(1);
  const scrollViewRef = useRef();
  const verseRefs = useRef({}); // Store native handles, not elements

  // Fetch the full chapter when book/chapter changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setHighlightedVerse(1);
    // Use local JSON for all verses in this chapter
    const chapterData = getChapter(book, chapter);
    if (chapterData) {
      // Convert to array of { num, text }
      const versesArr = Object.entries(chapterData).map(([num, text]) => ({ num: parseInt(num, 10), text }));
      versesArr.sort((a, b) => a.num - b.num);
      setChapterVerses(versesArr);
      setReference(`${book} ${chapter}`);
      setTranslation('World English Bible');
    } else {
      setChapterVerses([]);
      setReference('');
      setTranslation('');
      setError('No verses found for this chapter.');
    }
    setLoading(false);
  }, [book, chapter]);

  // Scroll to selected verse when it changes
  useEffect(() => {
    if (
      scrollViewRef.current &&
      chapterVerses.length > 0 &&
      verseRefs.current[verse]
    ) {
      setHighlightedVerse(verse);
      setTimeout(() => {
        const nodeHandle = verseRefs.current[verse];
        if (nodeHandle) {
          // measureLayout: (relativeToNativeNode, callback)
          // getInnerViewNode is safe for ScrollView
          const scrollViewNode = scrollViewRef.current.getInnerViewNode();
          if (scrollViewNode) {
            // @ts-ignore
            // eslint-disable-next-line no-undef
            UIManager.measureLayout(
              nodeHandle,
              scrollViewNode,
              () => {},
              (x, y) => {
                scrollViewRef.current.scrollTo({ y, animated: true });
              }
            );
          }
        }
      }, 100);
      // Highlight animation: fade out highlight after 1.2s
      const timeout = setTimeout(() => setHighlightedVerse(null), 1200);
      return () => clearTimeout(timeout);
    }
  }, [verse, chapterVerses]);



  return (
    <SafeAreaView style={styles.container}>
      <MysticalHomeBackground />
      <View style={styles.inlinePickerRow}>
        <View style={[styles.inlinePickerGroup, styles.bookPickerGroup]}>
          <Text style={styles.headingLabel}>Book</Text>
          <View style={styles.pickerWrapper}>
            <VignetteBackground borderRadius={12} />
            <TouchableOpacity
              style={{ position: 'relative', minHeight: 48, justifyContent: 'center' }}
              onPress={() => setShowBookPickerModal(true)}
              accessibilityLabel="Open book picker"
              activeOpacity={0.8}
            >
              {/* Abbreviation overlay for selected value */}
              <Text style={styles.pickerAbbrOverlay} pointerEvents="none">
                {typeof book === 'string' ? (BOOK_ABBREVIATIONS[book] || book) : ''}
              </Text>
            </TouchableOpacity>
            <CustomPickerModal
              visible={showBookPickerModal}
              onRequestClose={() => setShowBookPickerModal(false)}
              options={BOOKS.map(item =>
                item.type === 'label'
                  ? { label: item.label, value: null, enabled: false }
                  : { label: item, value: item }
              )} // Modal options remain full names
              selectedValue={book}
              onValueChange={value => {
                if (typeof value === 'string' && value && value !== book) {
                  console.log(`🔄 [INTERNAL TEST 001][BibleScreen] Book changed: '${book}' → '${value}'`);
                  setBook(value);
                }
              }}
              title="Select Book"
            />
          </View>

        </View>
        <View style={[styles.inlinePickerGroup, styles.shortPickerGroup]}>
          <Text style={styles.headingLabel}>Chapter</Text>
          <View style={styles.pickerWrapper}>
            <VignetteBackground borderRadius={12} />
            <TouchableOpacity
              style={{ position: 'relative', minHeight: 48, justifyContent: 'center' }}
              onPress={() => setShowChapterPickerModal(true)}
              accessibilityLabel="Open chapter picker"
              activeOpacity={0.8}
            >
              {/* Overlay for selected chapter value */}
              <Text style={styles.pickerNumOverlay} pointerEvents="none">
                {chapter}
              </Text>
            </TouchableOpacity>
            <CustomPickerModal
              visible={showChapterPickerModal}
              onRequestClose={() => setShowChapterPickerModal(false)}
              options={chapters.map(c => ({ label: c.toString(), value: c }))}
              selectedValue={chapter}
              onValueChange={value => {
                if (typeof value === 'number' && value && value !== chapter) {
                  console.log(`🔄 [INTERNAL TEST 001][BibleScreen] Chapter changed: '${chapter}' → '${value}'`);
                  setChapter(value);
                }
              }}
              title="Select Chapter"
            />
          </View>
        </View>
        <View style={[styles.inlinePickerGroup, styles.shortPickerGroup]}>
          <Text style={styles.headingLabel}>Verse</Text>
          <View style={styles.pickerWrapper}>
            <VignetteBackground borderRadius={12} />
            <TouchableOpacity
              style={{ position: 'relative', minHeight: 48, justifyContent: 'center' }}
              onPress={() => setShowVersePickerModal(true)}
              accessibilityLabel="Open verse picker"
              activeOpacity={0.8}
              disabled={loading || verses.length === 0}
            >
              {/* Overlay for selected verse value */}
              <Text style={styles.pickerNumOverlay} pointerEvents="none">
                {verse}
              </Text>
            </TouchableOpacity>
            <CustomPickerModal
              visible={showVersePickerModal}
              onRequestClose={() => setShowVersePickerModal(false)}
              options={verses.map(v => ({ label: v.toString(), value: v }))}
              selectedValue={verse}
              onValueChange={value => {
                if (typeof value === 'number' && value && value !== verse) {
                  console.log(`🔄 [INTERNAL TEST 001][BibleScreen] Verse changed: '${verse}' → '${value}'`);
                  setVerse(value);
                }
              }}
              title="Select Verse"
            />
          </View>
        </View>
      </View>
      <Text style={styles.referenceHeading}>
        {book} {chapter}:{selectedRange && selectedRange.start !== selectedRange.end
          ? `${Math.min(selectedRange.start, selectedRange.end)}–${Math.max(selectedRange.start, selectedRange.end)}`
          : verse} <Text style={styles.translationHeading}>({translation})</Text>
      </Text>
      <View style={styles.verseBox}>
        <VignetteBackground borderRadius={18} />
        <ScrollView ref={scrollViewRef} style={{ flexGrow: 0, maxHeight: 560 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#4b3ca7" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              {chapterVerses.map((v, idx) => {
                const vNum = v.num || v.verse || idx;
                const uniqueKey = `${book}-${chapter}-${vNum}`;
                // Helper: is this verse in the selected range?
                const isVerseSelected = () => {
                  if (!selectedRange) return vNum === verse;
                  const { start, end } = selectedRange;
                  return vNum >= Math.min(start, end) && vNum <= Math.max(start, end);
                };
                // Determine if this is the top, middle, or bottom of a multi-verse selection
                let selectionShape = null;
                if (selectedRange && selectedRange.start !== selectedRange.end && isVerseSelected()) {
                  const minV = Math.min(selectedRange.start, selectedRange.end);
                  const maxV = Math.max(selectedRange.start, selectedRange.end);
                  if (vNum === minV && vNum === maxV) {
                    selectionShape = null; // Single verse, use default
                  } else if (vNum === minV) {
                    selectionShape = styles.selectedVerseTop;
                  } else if (vNum === maxV) {
                    selectionShape = styles.selectedVerseBottom;
                  } else {
                    selectionShape = styles.selectedVerseMiddle;
                  }
                }
                return (
                  <TouchableOpacity
                    key={uniqueKey}
                    onPress={() => {
                      // Passage selection logic
                      if (!selectedRange) {
                        setSelectedRange({ start: vNum, end: vNum });
                        setVerse(vNum);
                      } else if (selectedRange && selectedRange.start === selectedRange.end) {
                        if (vNum !== selectedRange.start) {
                          setSelectedRange({ start: selectedRange.start, end: vNum });
                          setVerse(vNum);
                        } else {
                          setSelectedRange(null);
                          setVerse(vNum);
                        }
                      } else {
                        setSelectedRange({ start: vNum, end: vNum });
                        setVerse(vNum);
                      }
                    }}
                    style={[
                      styles.verseTouchable,
                      isVerseSelected() && styles.selectedVerse,
                      selectionShape,
                      vNum === highlightedVerse && styles.highlightedVerse,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View
                      key={`view-${uniqueKey}`}
                      ref={el => {
                        if (el) {
                          verseRefs.current[vNum] = findNodeHandle(el);
                        }
                      }}
                    >
                      <Text style={styles.verseText}>
                        <Text style={styles.verseNumber}>{vNum} </Text>{v.text.trim()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>
      </View>
      <View style={styles.commentaryBox}>
        <MysticalButtonWithBackground
          style={styles.mysticalButton}
          onPress={() => {
            setShowCommentaryModal(true);
            setCommentaryRequested(true);
          }}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCommentaryModal}
        onRequestClose={() => setShowCommentaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {flexDirection: 'column', justifyContent: 'space-between'}]}>
            <ScrollWornEdgesCommentary style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 0 }} width={340} height={510} />
            <VignetteBackground borderRadius={22} />
            {/* Rustic vignette overlay for parchment edge effect */}
            
            {commentaryLoading ? (
              <ActivityIndicator size="large" color="#6c63ff" />
            ) : commentaryError ? (
              <Text style={styles.errorText}>{commentaryError}</Text>
            ) : commentary ? (
              <ScrollView contentContainerStyle={{paddingVertical: 24, flexGrow: 1}}>
                <Text style={[styles.illuminationLabelBible, {fontSize: 20, textAlign: 'center', marginBottom: 8}]}>Mystical Interpretation</Text>
                <Text style={[styles.verseRef, {fontSize: 16, textAlign: 'center', marginBottom: 12, color: '#4b3ca7', fontWeight: 'bold'}]}>
                  {book} {chapter}:{selectedRange ? (
                    selectedRange.start === selectedRange.end
                      ? selectedRange.start
                      : `${Math.min(selectedRange.start, selectedRange.end)}–${Math.max(selectedRange.start, selectedRange.end)}`
                  ) : verse}
                </Text>
                <Text style={[styles.commentary, {fontSize: 22, lineHeight: 32, textAlign: 'center', marginVertical: 16}]}> 
                  {(typeof commentary === 'string' ? commentary : commentary?.commentary)?.trim()}
                </Text>
              </ScrollView>
            ) : null}
            {/* Only render the close button if not loading, error, or commentary */}
            <TouchableOpacity
  style={styles.closeButton}
  onPress={() => setShowCommentaryModal(false)}
  accessibilityLabel="Close commentary overlay"
  activeOpacity={0.85}
>
  <GoldBubbleBackground width={140} height={48} borderRadius={24} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }} />
  <View style={{ position: 'absolute', left: 0, top: 0, width: 140, height: 48, alignItems: 'center', justifyContent: 'center', zIndex: 1, marginBottom: 10 }}>
    <Text style={{
      color: '#7a6334',
      fontWeight: 'bold',
      fontSize: 18,
      textAlign: 'center',
      letterSpacing: 0.5
    }}>Close</Text>
  </View>
</TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  illuminationLabelBible: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A889FF',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  headingLabel: {
    fontSize: 17,
    color: '#ffe066', // Gold
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Cardo-Bold',
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: 4,
    marginBottom: 2,
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  referenceHeading: {
    fontSize: 20,
    color: '#ffe066', // Gold
    fontWeight: 'bold',
    fontFamily: 'Cardo-Bold',
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
    marginVertical: 8,
  },
  translationHeading: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontFamily: 'Cardo-Bold',
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#2A004B', // Dark mystical purple
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'gold',
    alignSelf: 'center',
    fontFamily: 'serif', // Use Cardo/Spectral if available
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  inlinePickerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8, // reduced from 8
    marginHorizontal: 2, // reduced from 2
    alignSelf: 'center',
    maxWidth: 430,
    width: '100%',
    transform: [{ scale: 0.99 }],
    marginLeft: -6, // reduced for centering
  },
  inlinePickerGroup: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 0, // reduced from 2
  },
  bookPickerGroup: {
    flexBasis: '38%',
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 90, // slightly reduced
  },
  shortPickerGroup: {
    flexBasis: '32%', // slightly reduced
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 100, // reduced
  },
  pickerLabel: {
    fontSize: 16,
    color: '#bfae66',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    alignSelf: 'flex-start',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    width: '100%',
    backgroundColor: '#f5e4c3',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8a6d3b',
    marginBottom: 4, // reduced from 10
    overflow: 'hidden',
    elevation: 2,
    paddingVertical: 0, // reduced from 1
    paddingHorizontal: 0, // reduced from 1
    position: 'relative',
  },
  picker: {
    width: '100%',
    height: 48,
    backgroundColor: 'transparent',
    color: '#42370c',
    paddingVertical: 0,
    paddingRight: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterVersePicker: {
    width: '100%',
    height: 52, // slightly taller for better centering
    backgroundColor: 'transparent',
    color: '#42370c',
    paddingVertical: 0,
    paddingRight: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterVersePicker: {
    width: '100%',
    height: 50, // slightly taller for better centering
    backgroundColor: 'transparent',
    color: '#42370c',
    paddingVertical: 0,
    paddingRight: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItem: {
    fontSize: 16,
    color: '#42370c',
    fontWeight: '600',
    height: 48,
    textAlignVertical: 'center',
  },
  chapterVersePickerItem: {
    fontSize: 18, // slightly larger for clarity
    color: '#42370c',
    fontWeight: '600',
    height: 52, // match chapterVersePicker
    lineHeight: 52, // ensure vertical centering
    textAlignVertical: 'center',
  },
  chapterVersePickerItem: {
    fontSize: 18, // slightly larger for clarity
    color: '#42370c',
    fontWeight: '600',
    height: 50, // match chapterVersePicker
    lineHeight: 50, // ensure vertical centering
    textAlignVertical: 'center',
  },
  pickerAbbrOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    textAlign: 'left',
    paddingLeft: 8, // reduced from 12
    paddingRight: 18, // reduced from 28
    fontSize: 15, // reduced from 17
    color: '#42370c',
    fontWeight: '600',
    lineHeight: 44, // match reduced picker height
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  pickerNumOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -1,
    bottom: 0,
    zIndex: 2,
    textAlign: 'left',
    paddingLeft: 11, // reduced from 12
    paddingRight: 18, // reduced from 28
    fontSize: 15,
    color: '#42370c',
    fontWeight: '600',
    lineHeight: 50, // match picker height
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  verseBox: {
    backgroundColor: '#f5e4c3', // darker parchment base
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#8a6d3b', // deep brown edge
    padding: 8, // reduced from 18
    marginBottom: 18, // reduced from 28
    minHeight: 40,
    maxHeight: 620, // doubled from 240
    shadowColor: '#3a1d00',
    shadowOpacity: 0.22,
    shadowRadius: 13,
    elevation: 6,
    overflow: 'hidden', // for vignette overlay
    position: 'relative',
  },
  verseTouchable: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  verseText: {
    fontSize: 18,
    color: '#3D0066',
    fontFamily: 'serif',
  },
  verseNumber: {
    fontWeight: 'bold',
    color: '#3D0066', // deep mystical purple
    fontSize: 18,
    fontFamily: 'serif',
    textShadowColor: '#fffbe6', // subtle parchment highlight
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedVerse: {
    backgroundColor: 'rgba(168,137,255,0.3)', // Soft royal accent, 40% opacity
    color: '#fffbe6',
    fontWeight: 'bold',
    borderRadius: 10, // Default for single selection
  },
  selectedVerseTop: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  selectedVerseMiddle: {
    borderRadius: 0,
  },
  selectedVerseBottom: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  highlightedVerse: {
    backgroundColor: 'rgba(255,224,102,0.3)', // 80% opacity
    color: '#333',
    fontWeight: 'bold',
    borderRadius: 10, // Rounded corners
    transitionProperty: 'background-color',
    transitionDuration: '0.6s',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,20,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#f5e4c3', // darker parchment base
    borderRadius: 22,
    padding: 28,
    width: '92%',
    height: '95%',
    elevation: 10,
    borderWidth: 2,
    borderColor: '#8a6d3b', // deep brown edge
    shadowColor: '#3a1d00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    alignSelf: 'center',
    // Simulate darker edges and rustic texture
  },

    zIndex: 2,
  commentaryBox: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    width: '100%', // Allow button to use full width
    alignItems: 'center',
  },
  commentaryTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#4b3ca7',
  },
  commentaryText: {
    color: '#555',
  },
  mysticalButton: {
    backgroundColor: 'transparent', // SVG provides background now
    borderWidth: 0,
    borderRadius: 32, // Elongated pill
    paddingVertical: 20,
    paddingHorizontal: 14, // Comfortable text area
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -16, // Move up further for tighter spacing
    width: '103%', // Maximize width
    overflow: 'hidden', // Ensure SVG is clipped to rounded rect
    shadowColor: 'transparent',
    elevation: 0,
  },
  mysticalButtonText: {
    fontFamily: 'SpectralSC-Bold', // Decorative serif or script, fallback to Cardo-Bold or serif
    fontSize: 19,
    color: '#ffe066', // Gold
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    paddingHorizontal: 0, // Ensure no extra padding
    includeFontPadding: false,
  },
  closeButton: {
    // backgroundColor and shadow removed to allow SVG bubble to show through
    borderRadius: 26,
    width: 140,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 2,
    overflow: 'visible',
    position: 'relative',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  closeButtonText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.1,
    fontFamily: 'Cardo-Bold',
    textShadowColor: '#fffbe6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  filigree: {
    fontFamily: 'SpectralSC-Bold', // Try a stylish serif, fallback to Cardo-Bold or serif
    fontSize: 16,
    color: '#ffe066', // Gold
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textAlign: 'center',
    maxWidth: '100%',
    paddingHorizontal: 0,
  }
});

function MysticalButtonWithBackground(props) {
  const [bgDims, setBgDims] = React.useState({ width: 320, height: 56 });
  return (
    <TouchableOpacity
      {...props}
      style={[styles.mysticalButton, props.style]}
      activeOpacity={0.85}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        if (width && height && (width !== bgDims.width || height !== bgDims.height)) {
          setBgDims({ width, height });
        }
      }}
    >
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <MysticalButtonBackground width={bgDims.width} height={bgDims.height} />
      </View>
      <Text style={styles.mysticalButtonText} numberOfLines={1} ellipsizeMode="tail">
        Get Mystical Interpretation
      </Text>
    </TouchableOpacity>
  );
}

export default BibleScreen;

