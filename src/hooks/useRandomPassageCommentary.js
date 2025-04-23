import { useState, useCallback, useEffect } from 'react';
import { useCommentary } from './useCommentary';

/**
 * Custom hook for DivineInspirationScreen to fetch a random passage and its mystical commentary.
 * Handles passage selection, local/global commentary fetching, and exposes UI state.
 */
import { BIBLE_STRUCTURE } from '../utils/bibleStructure';
import { getVerse } from '../utils/bibleText';

function getRandomAnchorVersePassage() {
  const books = Object.keys(BIBLE_STRUCTURE);
  const book = books[Math.floor(Math.random() * books.length)];
  const { chapters, verses } = BIBLE_STRUCTURE[book];
  const chapterIdx = Math.floor(Math.random() * chapters);
  const chapter = chapterIdx + 1;
  const numVerses = verses[chapterIdx];
  const anchorVerse = Math.floor(Math.random() * numVerses) + 1;
  return { book, chapter, anchorVerse, numVerses };
}

export function useRandomPassageCommentary() {
  const [passage, setPassage] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showCommentaryModal, setShowCommentaryModal] = useState(false);
  const [error, setError] = useState(null);
  // Track if anchorVerse-based fetch is needed
  const [anchorReFetch, setAnchorReFetch] = useState(false);

  // Generate a new random passage and fetch its commentary
  const getNewPassage = useCallback(() => {
    const p = getRandomAnchorVersePassage();
    // Fetch all verses in the chapter for context and UI
    let verseArray = [];
    for (let v = 1; v <= p.numVerses; v++) {
      const verseText = getVerse(p.book, p.chapter, v);
      if (verseText) {
        verseArray.push({ num: v, text: verseText });
      }
    }
    setPassage({
      book: p.book,
      chapter: p.chapter,
      anchorVerse: p.anchorVerse,
      anchorVerseText: null,
      verses: [], // will be set after backend response
      reference: `${p.book} ${p.chapter}:${p.anchorVerse}`,
      // startVerse/endVerse will be set after backend response
    });
    setShowReasoning(false);
    setShowCommentaryModal(false);
    setError(null);
    setAnchorReFetch(false);
  }, []);

  // Use the first verse for commentary lookup, or anchorVerse if available
  const { commentary, loading, error: commentaryError, refresh, refreshFromGlobal, anchorVerse, anchorVerseText } =
    useCommentary(
      passage?.book,
      passage?.chapter,
      passage?.anchorVerse,
      passage
        ? {
            anchorVerse: passage.anchorVerse
          }
        : undefined
    );

  // Defensive: treat commentary as object after backend response
  const commentaryText = commentary && commentary.commentary ? commentary.commentary : null;
  const commentaryStartVerse = commentary && commentary.startVerse ? commentary.startVerse : null;
  const commentaryEndVerse = commentary && commentary.endVerse ? commentary.endVerse : null;

  // Update passage with anchorVerseText and LLM-selected passage verses after backend response
  // Update passage with LLM-selected passage verses after backend response
  useEffect(() => {
    if (
      passage &&
      commentaryStartVerse &&
      commentaryEndVerse &&
      Array.isArray(passage.verses)
    ) {
      const needsUpdate =
        passage.startVerse !== commentaryStartVerse ||
        passage.endVerse !== commentaryEndVerse ||
        passage.verses.length !== (commentaryEndVerse - commentaryStartVerse + 1) ||
        passage.verses[0]?.num !== commentaryStartVerse;

      if (needsUpdate) {
        const selectedVerses = [];
        for (let v = commentaryStartVerse; v <= commentaryEndVerse; v++) {
          const text = getVerse(passage.book, passage.chapter, v);
          if (text) selectedVerses.push({ num: v, text });
        }
        setPassage(prev => prev && {
          ...prev,
          startVerse: commentaryStartVerse,
          endVerse: commentaryEndVerse,
          verses: selectedVerses,
        });
      }
    }
    // eslint-disable-next-line
  }, [commentaryStartVerse, commentaryEndVerse, passage?.book, passage?.chapter]);

  // Separate effect for anchorVerseText
  useEffect(() => {
    if (passage && passage.anchorVerse && !passage.anchorVerseText) {
      const verseObj = passage.verses?.find(v => v.num === passage.anchorVerse);
      if (verseObj && verseObj.text) {
        setPassage(prev => prev && {
          ...prev,
          anchorVerseText: verseObj.text,
        });
      } else {
        const text = getVerse(passage.book, passage.chapter, passage.anchorVerse);
        if (text) {
          setPassage(prev => prev && ({
            ...prev,
            anchorVerseText: text,
          }));
        }
      }
    }
    // eslint-disable-next-line
  }, [passage?.anchorVerse, passage?.verses]);

  // Compose result for UI
  return {
    passage,
    getNewPassage,
    commentary,
    commentaryLoading: loading,
    commentaryError: error || commentaryError,
    showReasoning,
    setShowReasoning,
    showCommentaryModal,
    setShowCommentaryModal,
    refresh,
    refreshFromGlobal,
  };
}
