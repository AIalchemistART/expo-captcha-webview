import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, Text, StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Button, UIManager, findNodeHandle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import apiConfig from '../config/api';
import { BIBLE_STRUCTURE } from '../utils/bibleStructure';
import { BOOK_ABBREVIATIONS } from '../utils/bookAbbreviations';
import { getVerse, getChapter } from '../utils/bibleText';

const BibleScreen = ({ navigation }) => {
  useEffect(() => {
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerTitle: () => (
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#bfae66',
            textAlign: 'center',
          }}>
            Bible
          </Text>
        ),
        headerTitleAlign: 'center',
      });
    }
  }, [navigation]);

  const [showCommentaryModal, setShowCommentaryModal] = useState(false);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [commentaryError, setCommentaryError] = useState(null);
  const [commentaryResult, setCommentaryResult] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [book, setBook] = useState('Genesis');
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  // Passage selection state
  const [selectedRange, setSelectedRange] = useState(null); // {start: number, end: number} or null
  const [chapterVerses, setChapterVerses] = useState([]);
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedVerse, setHighlightedVerse] = useState(1);
  const scrollViewRef = useRef();
  const verseRefs = useRef({});

  useEffect(() => {
    setChapter(1);
    setVerse(1);
    setSelectedRange(null);
  }, [book]);
  useEffect(() => {
    setVerse(1);
    setSelectedRange(null);
  }, [chapter]);

  // Defensive: Only access book data if book is valid
  const bookData = BIBLE_STRUCTURE[book];
  const chapters = Array.from({ length: bookData?.chapters || 1 }, (_, i) => i + 1);
  const verseCount = bookData?.verses?.[chapter - 1] || 1;
  const verses = Array.from({ length: verseCount }, (_, i) => i + 1);

  // Fetch the full chapter when book/chapter changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setHighlightedVerse(1);
    const chapterData = getChapter(book, chapter);
    if (chapterData) {
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

  // Helper: is this verse in the selected range?
  const isVerseSelected = (vNum) => {
    if (!selectedRange) return vNum === verse;
    const { start, end } = selectedRange;
    return vNum >= Math.min(start, end) && vNum <= Math.max(start, end);
  };

  // Fetch mystical commentary for selected verse or passage
  const fetchMysticalCommentary = async () => {
    setCommentaryLoading(true);
    setCommentaryError(null);
    setCommentaryResult(null);
    setShowReasoning(false);
    try {
      let startVerse = verse;
      let endVerse = verse;
      if (selectedRange) {
        startVerse = Math.min(selectedRange.start, selectedRange.end);
        endVerse = Math.max(selectedRange.start, selectedRange.end);
      }
      const response = await fetch(`${apiConfig.API_BASE_URL}/api/llm-contextual-passage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book, chapter, verse: startVerse, endVerse }),
      });
      if (!response.ok) throw new Error('Failed to fetch mystical commentary.');
      const data = await response.json();
      setCommentaryResult(data);
    } catch (err) {
      setCommentaryError(err.message || 'Unknown error');
    } finally {
      setCommentaryLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ...existing dropdowns... */}
      <ScrollView style={styles.verseBox} ref={scrollViewRef}>
        {loading ? (
          <ActivityIndicator size="large" color="#4b3ca7" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {chapterVerses.map((v, idx) => {
              const vNum = v.num || v.verse || idx;
              const uniqueKey = `${book}-${chapter}-${vNum}`;
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
                    isVerseSelected(vNum) && styles.selectedVerse,
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
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
      {/* ...existing commentary modal and GMI button... */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ...reuse your existing styles...
});

export default BibleScreen;
