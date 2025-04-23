import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig from '../config/api';

// --- Robust logging for Supabase config ---
console.log('[Supabase Config] URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('[Supabase Config] Anon Key present:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);


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
console.log('\x1b[32m\x1b[1m[INTERNAL TEST][HOOK INIT v2025-04-23-OTA] useCommentary loaded!\x1b[0m');
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
    // Defensive: abort if any required param is null/undefined
    if (
      book == null || chapter == null || startVerse == null || endVerse == null ||
      book === '' || isNaN(Number(chapter)) || isNaN(Number(startVerse)) || isNaN(Number(endVerse))
    ) {
      console.warn('[INTERNAL TEST][Early Return] Missing/invalid params. Skipping commentary fetch.', { book, chapter, startVerse, endVerse });
      setError('Missing or invalid passage parameters.');
      setLoading(false);
      setCommentary(null);
      return;
    }
    // Magenta bold: \x1b[35m\x1b[1m ... \x1b[0m
    console.log('\x1b[35m\x1b[1m[INTERNAL TEST] Params valid, proceeding to fetch/caching logic\x1b[0m');
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
          console.log('[INTERNAL TEST][Cache Hit] Found commentary in AsyncStorage (anchor).');
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
      console.log('[useCommentary] Supabase query (anchor) - about to run:', { book, chapter, startVerse, endVerse, anchorVerseParam });
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
      // --- INTERNAL TEST 002: Hardcoded fetch URL and deep logging ---
      const commentaryUrl = `${apiConfig.API_BASE_URL}/api/llm-contextual-passage`;
      console.log('[INTERNAL TEST 004][FETCH] About to fetch (env URL):', commentaryUrl);
      console.log('[INTERNAL TEST 004][FETCH] Payload:', payload);
      let fetchStart = Date.now();
      const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      };
      console.log('[INTERNAL TEST 004][FETCH] About to fetch', commentaryUrl, 'with options:', fetchOptions);
      try {
        const response = await fetch(commentaryUrl, fetchOptions);
        let fetchEnd = Date.now();
        console.log('[INTERNAL TEST 004][FETCH] Response object:', response, 'Duration(ms):', fetchEnd - fetchStart);
        if (!response.ok) throw new Error('Failed to generate mystical commentary.');
        const apiData = await response.json();
        console.log('[INTERNAL TEST 003][FETCH] API Response JSON:', apiData);
        if (!apiData || !apiData.commentary) throw new Error('No commentary returned from API.');
        setCommentary(apiData); // Store the full API response for downstream use
        console.log('[INTERNAL TEST 003][FETCH] Commentary set:', apiData);

        // Debug: Log full API response and anchor selected
        console.log('[useCommentary] Full API response:', apiData);

        // Extract anchor verse from API response (randomVerse.verse)
        let anchorVerseFromApi = null;
        let anchorVerseTextFromApi = null;
        if (apiData.randomVerse && typeof apiData.randomVerse.verse === 'number') {
          anchorVerseFromApi = apiData.randomVerse.verse;
          anchorVerseTextFromApi = apiData.randomVerse.text;
          setAnchorVerse(anchorVerseFromApi);
          setAnchorVerseText(anchorVerseTextFromApi);
        }
        console.log('[useCommentary] Using anchorVerseFromApi for Supabase:', anchorVerseFromApi, 'Text:', anchorVerseTextFromApi);

        // Use the LLM-selected passage range for all downstream logic
        const llmStartVerse = apiData.startVerse || startVerse;
        const llmEndVerse = apiData.endVerse || endVerse;
        // Compose cache keys for this LLM-selected range
        const llmKeyPassageAnchor = anchorVerseParam !== null && anchorVerseParam !== undefined ? `commentary:${book}:${chapter}:${llmStartVerse}-${llmEndVerse}:${anchorVerseParam}` : null;
        const llmKeyPassage = `commentary:${book}:${chapter}:${llmStartVerse}-${llmEndVerse}`;

        // Cache in local storage
        try {
          // Use the most specific key for caching
          await AsyncStorage.setItem(llmKeyPassageAnchor || llmKeyPassage, JSON.stringify(apiData.commentary));
          console.log('[useCommentary] Saved generated commentary to AsyncStorage:', llmKeyPassageAnchor || llmKeyPassage, apiData.commentary);
        } catch (err) {
          console.log('[useCommentary] Failed to save generated commentary to AsyncStorage:', err);
        }
        // Insert into Supabase for future use
        try {
          // --- Log Supabase client and env ---
          console.log('[Supabase Insert Debug] supabase object:', !!supabase);
          console.log('[Supabase Insert Debug] process.env.EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
          console.log('[Supabase Insert Debug] process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY present:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
          // --- Log getSession before insert ---
          if (supabase && supabase.auth && supabase.auth.getSession) {
            const sessionResult = await supabase.auth.getSession();
            console.log('[Supabase Insert Debug] getSession result:', sessionResult);
          } else {
            console.log('[Supabase Insert Debug] supabase.auth.getSession not available');
          }
          // --- Log getUser before insert ---
          let userData = null;
          let userError = null;
          if (supabase && supabase.auth && supabase.auth.getUser) {
            const userResult = await supabase.auth.getUser();
            userData = userResult.data;
            userError = userResult.error;
            console.log('[Supabase User] Session/user before insert:', userData?.user, userError);
          } else {
            console.log('[Supabase Insert Debug] supabase.auth.getUser not available');
          }
          // --- Log insert payload ---
          const supabasePayload = { book, chapter, start_verse: llmStartVerse, end_verse: llmEndVerse, commentary: apiData.commentary };
          if (anchorVerseParam !== null && anchorVerseParam !== undefined) {
            supabasePayload.anchor_verse = anchorVerseParam;
          }
          console.log('[useCommentary] Supabase insert payload:', supabasePayload);
          // --- Perform insert and log result ---
          const { data: insertData, error: insertError } = await supabase.from('commentaries').insert([supabasePayload]);
          if (insertError) {
            console.error('[useCommentary] Supabase insert error:', insertError);
          } else {
            console.log('[useCommentary] Inserted commentary into Supabase:', insertData);
          }
          // --- Log select for verification ---
          const { data: selectTest, error: selectError } = await supabase.from('commentaries').select('*').limit(1);
          console.log('[Supabase Select Test] Data:', selectTest, 'Error:', selectError);
        } catch (err) {
          console.log('[useCommentary] Exception during Supabase insert:', err);
        }
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
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('[INTERNAL TEST][OpenAI API] General error in commentary generation:', err);
      setError('No commentary found for this passage and failed to generate new commentary. ' + (err.message || err));
    }
    setLoading(false);
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

  useEffect(() => {
    fetchCommentary();
  }, [fetchCommentary]);

  // Robust refresh: remove all possible keys for this passage context, then refetch
  const refresh = () => {
    const removals = [];
    if (keyPassageAnchor) removals.push(AsyncStorage.removeItem(keyPassageAnchor));
    removals.push(AsyncStorage.removeItem(keyPassage));
    removals.push(AsyncStorage.removeItem(keySingle));
    Promise.all(removals).then(fetchCommentary);
  };

  return { commentary, loading, error, refresh, refreshFromGlobal, anchorVerse, anchorVerseText };
}
