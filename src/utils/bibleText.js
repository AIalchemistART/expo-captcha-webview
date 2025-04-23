import bibleData from './web_bible.json';

/**
 * Get the text of a specific verse.
 * @param {string} book - Book name (e.g., 'Genesis')
 * @param {string|number} chapter - Chapter number (as string or number)
 * @param {string|number} verse - Verse number (as string or number)
 * @returns {string|null}
 */
export function getVerse(book, chapter, verse) {
  if (!book || !chapter || !verse) return null;
  const c = String(chapter);
  const v = String(verse);
  return bibleData?.[book]?.[c]?.[v] || null;
}

/**
 * Get all verses in a chapter as an object {verseNum: text, ...}
 * @param {string} book
 * @param {string|number} chapter
 * @returns {object|null}
 */
export function getChapter(book, chapter) {
  if (!book || !chapter) return null;
  const c = String(chapter);
  return bibleData?.[book]?.[c] || null;
}

/**
 * Get all chapters for a book (object of chapters)
 * @param {string} book
 * @returns {object|null}
 */
export function getBook(book) {
  if (!book) return null;
  return bibleData?.[book] || null;
}

export default {
  getVerse,
  getChapter,
  getBook,
};
