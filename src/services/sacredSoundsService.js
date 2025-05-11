// services/sacredSoundsService.js
// Fetches Sacred Sounds track metadata (with S3 URLs) from Supabase
import { supabase } from './supabase';

/**
 * Fetches all Sacred Sounds tracks from the 'commentaries' table that have a non-empty s3_urls array.
 * For each row, randomly selects one s3Url from the array for playback.
 * Returns: [{ id, title, artist, lyrics, s3Url, metadata }]
 */
export async function fetchSacredSounds() {
  // Adjust table/column names as needed for your Supabase schema
  const { data, error } = await supabase
    .from('commentaries')
    .select('id, s3_urls, book, chapter, start_verse, end_verse, anchor_verse, commentary, is_free_sacred_sound')
    .not('s3_urls', 'is', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) {
    console.log('[fetchSacredSounds] No data returned from Supabase.');
    return [];
  }
  console.log('[fetchSacredSounds] Raw data from Supabase:', data);
  const filtered = data.filter(row => {
    let urls = row.s3_urls;
    if (typeof urls === 'string') {
      try { urls = JSON.parse(urls); } catch (e) {
        console.log(`[fetchSacredSounds] Row id=${row.id} invalid JSON in s3_urls:`, row.s3_urls);
        return false;
      }
    }
    if (!urls || !Array.isArray(urls.Vanitas) || urls.Vanitas.length === 0) {
      console.log(`[fetchSacredSounds] Row id=${row.id} skipped: no valid Vanitas array`, urls);
      return false;
    }
    console.log(`[fetchSacredSounds] Row id=${row.id} accepted:`, urls.Vanitas);
    return true;
  });
  console.log(`[fetchSacredSounds] Filtered tracks count: ${filtered.length}`);
  return filtered.map(row => {
    let urls = row.s3_urls;
    if (typeof urls === 'string') {
      try { urls = JSON.parse(urls); } catch { urls = { audio: [] }; }
    }
    // Pick a random URL from the audio array
    const s3Url = urls.Vanitas[Math.floor(Math.random() * urls.Vanitas.length)];
    // Helper: Remove trailing (1) and .mp3 from file name
    function getSongTitleFromUrl(url) {
      let fileName = url.split('/').pop();
      console.log('[getSongTitleFromUrl] raw fileName:', fileName);
      fileName = fileName.replace(/\+/g, ' ');
      console.log('[getSongTitleFromUrl] after plus replace:', fileName);
      const decoded = decodeURIComponent(fileName);
      console.log('[getSongTitleFromUrl] after decodeURIComponent:', decoded);
      const noExt = decoded.replace(/\.mp3$/i, '');
      const noSuffix = noExt.replace(/\s*\(\d+\)$/, '');
      console.log('[getSongTitleFromUrl] final title:', noSuffix);
      return noSuffix;
    }
    // Fix: Always pick a random index if 2+ URLs, else pick the only one
    let pickedIndex = 0;
    if (Array.isArray(urls.Vanitas) && urls.Vanitas.length > 1) {
      pickedIndex = Math.floor(Math.random() * urls.Vanitas.length);
    }
    const pickedUrl = urls.Vanitas[pickedIndex];
    // [PRODUCTION] Do not log row ids or urls. Commented for production safety.
// console.log(`[fetchSacredSounds] Row id=${row.id} picked index: ${pickedIndex}, url: ${pickedUrl}`);
    return {
      id: row.id,
      title: getSongTitleFromUrl(pickedUrl),
      artist: 'Vanitas',
      lyrics: '',
      s3Url: pickedUrl,
      isFreeSacredSound: !!row.is_free_sacred_sound,
      metadata: {
        book: row.book,
        chapter: row.chapter,
        startverse: row.start_verse,
        endverse: row.end_verse,
        anchorverse: row.anchor_verse,
        commentary: row.commentary,
      },
    };

  });
}
