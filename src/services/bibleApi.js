// src/services/bibleApi.js
// Utility for fetching Bible verses from bible-api.com

export async function fetchVerse(book, chapter, verse) {
  const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}:${verse}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch verse');
    }
    const data = await response.json();
    // bible-api returns 'text' for the verse
    return {
      text: data.text || '',
      reference: data.reference || '',
      translation: data.translation_name || '',
      error: null,
    };
  } catch (error) {
    return {
      text: '',
      reference: '',
      translation: '',
      error: error.message || 'Unknown error',
    };
  }
}
