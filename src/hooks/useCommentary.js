import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from '../config/api';

// --- Robust logging for Supabase config ---
// console.log('[Supabase Config] URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
// console.log('[Supabase Config] Anon Key present:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);


/**
 * Custom React hook to fetch and cache mystical commentary for a given passage.
 * Checks local storage first, then Supabase if not found. Caches results locally for offline use.
 *
 * @param {string} book - Book name (e.g., 'Genesis')
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {object} { commentary, loading, error, refresh }
 */
// Accepts an optional passageRange for accurate commentary generation
// Green bold: \x1b[32m\x1b[1m ... \x1b[0m
// // console.log('\x1b[32m\x1b[1m[INTERNAL TEST][HOOK INIT v2025-04-23-OTA] useCommentary loaded!\x1b[0m');
export function useCommentary(book, chapter, verse, passageRange) {
  const [commentary, setCommentary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorVerse, setAnchorVerse] = useState(null);
  const [anchorVerseText, setAnchorVerseText] = useState(null);

  // Use passage range and anchorVerse for key if available
  let startVerse = 1;
  let endVerse = 1;
  let anchorVerseParam = null;
  if (passageRange && typeof passageRange.startVerse === 'number') startVerse = passageRange.startVerse;
  if (passageRange && typeof passageRange.endVerse === 'number') endVerse = passageRange.endVerse;
  if (passageRange && passageRange.anchorVerse !== undefined) anchorVerseParam = passageRange.anchorVerse;
  else if (typeof verse === 'number' && !isNaN(verse)) {
    startVerse = verse;
    endVerse = verse;
  }

  // Defensive: Ensure startVerse and endVerse are always valid integers
  if (typeof startVerse !== 'number' || isNaN(startVerse)) {
    console.error('[useCommentary:FATAL] Invalid startVerse:', startVerse, 'from passageRange:', passageRange, 'verse:', verse);
    setError('Internal error: Invalid start verse.');
    setLoading(false);
    return { commentary: null, loading: false, error: 'Internal error: Invalid start verse.' };
  }
  if (typeof endVerse !== 'number' || isNaN(endVerse)) {
    console.error('[useCommentary:FATAL] Invalid endVerse:', endVerse, 'from passageRange:', passageRange, 'verse:', verse);
    setError('Internal error: Invalid end verse.');
    setLoading(false);
    return { commentary: null, loading: false, error: 'Internal error: Invalid end verse.' };
  }
  // Keys for fallback lookup
  const keyPassageAnchor = anchorVerseParam !== null && anchorVerseParam !== undefined ? `commentary:${book}:${chapter}:${startVerse}-${endVerse}:${anchorVerseParam}` : null;
  const keyPassage = `commentary:${book}:${chapter}:${startVerse}-${endVerse}`;
  const keySingle = `commentary:${book}:${chapter}:${startVerse}`;

  // Fetch commentary, prioritizing local cache and never overwriting it unless explicitly requested
  const fetchCommentary = useCallback(async () => {
    // Cyan bold: \x1b[36m\x1b[1m ... \x1b[0m
    console.log('\x1b[36m\x1b[1m[INTERNAL TEST] fetchCommentary TRIGGERED\x1b[0m');
    console.log('[useCommentary] fetchCommentary called with:', { book, chapter, verse, startVerse, endVerse, anchorVerseParam, passageRange });
    // Diagnostic: log API URL from config
    console.log('[useCommentary][DIAG] apiConfig.API_BASE_URL:', apiConfig.API_BASE_URL);
    if (!apiConfig.API_BASE_URL) {
      console.error('[useCommentary][FATAL] API_BASE_URL is missing!');
    }
    // Defensive: abort if any required param is null/undefined
    if (
      book == null || chapter == null || startVerse == null || endVerse == null ||
      book === '' || isNaN(Number(chapter)) || isNaN(Number(startVerse)) || isNaN(Number(endVerse))
    ) {
      // Only log and setError if at least one param is non-null/non-empty and not defaulted to 1
      const isDefaultOrNull = (val) => val === null || val === undefined || val === '' || val === 1;
      if (!isDefaultOrNull(book) || !isDefaultOrNull(chapter) || !isDefaultOrNull(startVerse) || !isDefaultOrNull(endVerse)) {
        console.error('[useCommentary][DIAG] Invalid params for fetch:', { book, chapter, startVerse, endVerse });
        console.warn('[INTERNAL TEST][Early Return] Missing/invalid params. Skipping commentary fetch.', { book, chapter, startVerse, endVerse });
        setError('Missing or invalid passage parameters.');
      }
      // If all are null/undefined/empty/1, silently return (no error, no log)
      setLoading(false);
      setCommentary(null);
      return;
    }
    // Magenta bold: \x1b[35m\x1b[1m ... \x1b[0m
    // console.log('\x1b[35m\x1b[1m[INTERNAL TEST] Params valid, proceeding to fetch/caching logic\x1b[0m');
    // Reset error/loading/commentary state on valid params
    setLoading(true);
    setError(null);
    setCommentary(null);

    // 1. Try local storage with anchor (if present), then passage, then single verse
    try {
      let cached = null;
      if (keyPassageAnchor) {
        cached = await AsyncStorage.getItem(keyPassageAnchor);
        if (cached) {
          // console.log('[INTERNAL TEST][Cache Hit] Found commentary in AsyncStorage (anchor).');
          setCommentary(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }
      cached = await AsyncStorage.getItem(keyPassage);
      if (cached) {
        console.log('[INTERNAL TEST][Cache Hit] Found commentary in AsyncStorage (passage).');
        setCommentary(JSON.parse(cached));
        setLoading(false);
        return;
      }
      cached = await AsyncStorage.getItem(keySingle);
      if (cached) {
        console.log('[INTERNAL TEST][Cache Hit] Found commentary in AsyncStorage (single).');
        setCommentary(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('[useCommentary] AsyncStorage error:', err);
    }
    console.log('[INTERNAL TEST][Cache Miss] No commentary found in AsyncStorage, proceeding to Supabase.');

    // 2. Try Supabase DB (anchor, passage, single-verse)
    let supaData = null;
    let supaError = null;
    // Try passage + anchor
    if (anchorVerseParam !== null && anchorVerseParam !== undefined) {
      // console.log('[useCommentary] Supabase query (anchor) - about to run:', { book, chapter, startVerse, endVerse, anchorVerseParam });
      ({ data: supaData, error: supaError } = await supabase
        .from('commentaries')
        .select('commentary')
        .eq('book', book)
        .eq('chapter', chapter)
        .eq('start_verse', startVerse)
        .eq('end_verse', endVerse)
        .eq('anchor_verse', anchorVerseParam)
        .maybeSingle());
    }
    // If anchorVerseParam is null/undefined, skip anchor_verse queries entirely
    // Try passage only
    if ((!supaData || !supaData.commentary) && !supaError) {
      console.log('[useCommentary] Supabase query (passage) - about to run:', { book, chapter, startVerse, endVerse, anchorVerseParam: null });
      ({ data: supaData, error: supaError } = await supabase
        .from('commentaries')
        .select('commentary')
        .eq('book', book)
        .eq('chapter', chapter)
        .eq('start_verse', startVerse)
        .eq('end_verse', endVerse)
        .is('anchor_verse', null)
        .maybeSingle());
    }
    // Try single verse
    if ((!supaData || !supaData.commentary) && !supaError) {
      console.log('[useCommentary] Supabase query (single verse) - about to run:', { book, chapter, startVerse, endVerse: startVerse, anchorVerseParam: null });
      ({ data: supaData, error: supaError } = await supabase
        .from('commentaries')
        .select('commentary')
        .eq('book', book)
        .eq('chapter', chapter)
        .eq('start_verse', startVerse)
        .eq('end_verse', startVerse)
        .is('anchor_verse', null)
        .maybeSingle());
    }
    if (supaError) {
      console.error('[useCommentary] Supabase error:', supaError);
      setError('Error fetching from Supabase: ' + supaError.message);
      setLoading(false);
      return;
    }
    if (supaData && supaData.commentary) {
      console.log('[INTERNAL TEST][Supabase Hit] Found commentary in Supabase.');
      setCommentary(supaData.commentary);
      // Cache in local storage
      try {
        await AsyncStorage.setItem(keyPassageAnchor || keyPassage, JSON.stringify(supaData.commentary));
        console.log('[useCommentary] Saved commentary from Supabase to AsyncStorage:', keyPassageAnchor || keyPassage, supaData.commentary);
      } catch (err) {
        console.log('[useCommentary] Failed to save commentary from Supabase to AsyncStorage:', err);
      }
      setLoading(false);
      return;
    }
    console.log('[INTERNAL TEST][Supabase Miss] No commentary found in Supabase, will attempt OpenAI API fallback.');

    // 3. If not found, call OpenAI-powered API to generate commentary
    try {
      let payload;
      if (
        anchorVerseParam !== null && anchorVerseParam !== undefined &&
        (!passageRange || (Object.keys(passageRange).length === 1 && passageRange.anchorVerse !== undefined))
      ) {
        // Divine Inspiration: Only send book, chapter, anchorVerse
        payload = { book, chapter, anchorVerse: anchorVerseParam };
      } else {
        // Bible tab or explicit passage: send full range
        payload = { book, chapter, startVerse, endVerse };
        if (anchorVerseParam !== null && anchorVerseParam !== undefined) {
          payload.anchorVerse = anchorVerseParam;
        }
      }
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
      // --- Try backend API for mystical commentary generation ---
      const apiUrl = `${apiConfig.API_BASE_URL}/api/llm-contextual-passage`;
      console.log('[useCommentary][DIAG] About to POST to backend:', apiUrl, payload);
      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (fetchErr) {
        console.error('[useCommentary][DIAG] Network error during fetch:', fetchErr);
        setError('Network error: ' + (fetchErr.message || fetchErr));
        setLoading(false);
        return;
      }
      console.log('[useCommentary][DIAG] Response status:', response.status);
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('[useCommentary][DIAG] Error parsing JSON:', jsonErr);
        setError('Error parsing server response: ' + (jsonErr.message || jsonErr));
        setLoading(false);
        return;
      }
      if (!response.ok) {
        console.error('[useCommentary][DIAG] Backend error:', data);
        throw new Error('Failed to fetch mystical commentary from backend. ' + (data?.error || ''));
      }
      console.log('[useCommentary][DIAG] Received commentary from backend:', data);
      setCommentary(data);
      await AsyncStorage.setItem(keyPassageAnchor || keyPassage, JSON.stringify(data));
      setLoading(false);
      // Optionally: insert into Supabase for global cache here if needed
    } catch (openAiErr) {
      // Enhanced error diagnostics
      console.error('[INTERNAL TEST 003][OpenAI API] Error during OpenAI API call:', openAiErr);
      console.error('[INTERNAL TEST 003][OpenAI API] Error typeof:', typeof openAiErr);
      if (openAiErr && openAiErr.stack) {
        console.error('[INTERNAL TEST 003][OpenAI API] Error stack:', openAiErr.stack);
      }
      if (typeof openAiErr === 'object') {
        for (const key in openAiErr) {
          if (Object.prototype.hasOwnProperty.call(openAiErr, key)) {
            console.error(`[INTERNAL TEST 003][OpenAI API] Error property: ${key}:`, openAiErr[key]);
          }
        }
      }
      setError('No commentary found for this passage and failed to generate new commentary. ' + (openAiErr.message || openAiErr));
    setError(null);
    setCommentary(null);
    // Remove all possible keys for this passage
    const removals = [];
    if (keyPassageAnchor) removals.push(AsyncStorage.removeItem(keyPassageAnchor));
    removals.push(AsyncStorage.removeItem(keyPassage));
    removals.push(AsyncStorage.removeItem(keySingle));
    await Promise.all(removals);
    // Now fetch from Supabase regardless of local cache
    const { data, error: supabaseError } = await supabase
      .from('commentaries')
      .select('commentary')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('start_verse', startVerse)
      .eq('end_verse', endVerse)
      .maybeSingle();
    if (supabaseError) {
      setError('Error fetching from Supabase: ' + supabaseError.message);
      setLoading(false);
      return;
    }
    if (data && data.commentary) {
      setCommentary(data.commentary);
      try {
        await AsyncStorage.setItem(keyPassageAnchor || keyPassage, JSON.stringify(data.commentary));
      } catch (err) {}
    } else {
      console.log('[Supabase Insert Debug] Supabase client not available');
    }
  }
// End of OpenAI API try/catch logic
  }, [book, chapter, verse, keyPassageAnchor, keyPassage, keySingle]);

  // Manual refresh function (removes local cache and fetches from global DB)
  const refreshFromGlobal = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCommentary(null);
    // Remove all possible keys for this passage
    const removals = [];
    if (keyPassageAnchor) removals.push(AsyncStorage.removeItem(keyPassageAnchor));
    removals.push(AsyncStorage.removeItem(keyPassage));
    removals.push(AsyncStorage.removeItem(keySingle));
    await Promise.all(removals);
    // Now fetch from Supabase regardless of local cache
    const { data, error: supabaseError } = await supabase
      .from('commentaries')
      .select('commentary')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('start_verse', startVerse)
      .eq('end_verse', endVerse)
      .maybeSingle();
    if (supabaseError) {
      setError('Error fetching from Supabase: ' + supabaseError.message);
      setLoading(false);
      return;
    }
    if (data && data.commentary) {
      setCommentary(data.commentary);
      try {
        await AsyncStorage.setItem(keyPassageAnchor || keyPassage, JSON.stringify(data.commentary));
      } catch (err) {}
    } else {
      setError('No commentary found for this passage.');
    }
    setLoading(false);
  }, [book, chapter, verse, keyPassageAnchor, keyPassage, keySingle]);

  // Robust refresh: remove all possible keys for this passage context, then refetch
  const refresh = () => {
    const removals = [];
    if (keyPassageAnchor) removals.push(AsyncStorage.removeItem(keyPassageAnchor));
    removals.push(AsyncStorage.removeItem(keyPassage));
    removals.push(AsyncStorage.removeItem(keySingle));
    Promise.all(removals).then(fetchCommentary);
  };

  useEffect(() => {
    fetchCommentary();
  }, [fetchCommentary]);

  return { commentary, loading, error, refresh, refreshFromGlobal, anchorVerse, anchorVerseText };
}
