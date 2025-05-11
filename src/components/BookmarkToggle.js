// BookmarkToggle.js
// A toggle button for bookmarking a passage in BibleScreen or DivineInspirationScreen
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addBookmark, deleteBookmark, isBookmarked, fetchBookmarks, updateBookmark } from '../services/bookmarks';

/**
 * Props:
 *   anchor: { book, chapter, startVerse, endVerse }
 *   commentary: string (optional)
 *   note: string (optional)
 *   onChange: (isBookmarked, bookmarkId) => void (optional)
 */
/**
 * Props:
 *   anchor: { book, chapter, startVerse, endVerse }
 *   commentary: string|object (optional) - mystical commentary text or object
 *   commentaryId: string|number (optional) - commentary_id from mystical commentary (for Supabase)
 *   note: string (optional)
 *   onChange: (isBookmarked, bookmarkId) => void (optional)
 */
export default function BookmarkToggle({ anchor, commentary = '', commentaryId = null, note = '', onChange, style = {}, iconColorActive = '#ffe066', iconColorInactive = '#fff', iconColorDefault = '#fff', isPremium = false, isAllowedFree = false, onPremiumBlock }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);

  // Ensure persistent bookmark state by checking Supabase for existing bookmark on mount
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function checkPersistedBookmark() {
  // [PRODUCTION] Do not log anchor or sensitive info. Commented for production safety.
// console.log('[BookmarkToggle][LOG] checkPersistedBookmark received anchor:', anchor);
      if (!anchor) {
        setBookmarked(false);
        setBookmarkId(null);
        setError('No anchor provided');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const bookmarks = await fetchBookmarks();
        // Match using the same logic as addBookmark (flat fields, not anchor subobject)
        const match = bookmarks.find(bm =>
          bm.book === anchor.book &&
          bm.chapter === anchor.chapter &&
          bm.start_verse === anchor.startVerse &&
          bm.end_verse === anchor.endVerse
        );
        if (isMounted && match) {
          setBookmarked(true);
          setBookmarkId(match.id);
          setError(null);
          // // console.log('[BookmarkToggle] Persistent bookmark found:', match);
        } else if (isMounted) {
          setBookmarked(false);
          setBookmarkId(null);
          setError(null);
          // // console.log('[BookmarkToggle] No persistent bookmark for anchor:', anchor);
        }
      } catch (err) {
        if (isMounted) {
          setBookmarked(false);
          setBookmarkId(null);
          setError('Failed to fetch bookmarks: ' + err.message);
        }
        if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[BookmarkToggle] Persistent check error:', err);
      }
      setLoading(false);
    }
    checkPersistedBookmark();
    return () => { isMounted = false; };
  }, [anchor]);


  const handleToggle = async () => {
  // [PRODUCTION] Do not log anchor or sensitive info. Commented for production safety.
// console.log('[BookmarkToggle][LOG] handleToggle received anchor:', anchor);
    if (loading || !anchor) return;
    // Premium gating logic
    if (!isPremium && isAllowedFree && typeof onPremiumBlock === 'function') {
      onPremiumBlock();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (bookmarked && bookmarkId) {
        await deleteBookmark(bookmarkId);
        setBookmarked(false);
        setBookmarkId(null);
        onChange && onChange(false, null);
        // // console.log('[BookmarkToggle] Bookmark removed:', bookmarkId);
      } else {
        // Check for existing bookmark BEFORE adding
        const bookmarks = await fetchBookmarks();
        const match = bookmarks.find(bm =>
          bm.book === anchor.book &&
          bm.chapter === anchor.chapter &&
          bm.start_verse === anchor.startVerse &&
          bm.end_verse === anchor.endVerse
        );
        if (match) {
          // Bookmark exists: update note/commentary if changed
          await updateBookmark(match.id, {
            note,
            commentary: typeof commentary === 'string' ? commentary : (commentary?.commentary || '')
          });
          setBookmarked(true);
          setBookmarkId(match.id);
          onChange && onChange(true, match.id);
          // console.log('[BookmarkToggle] Bookmark updated:', match.id);
        } else {
          // No bookmark exists: add new
          // console.log('[BookmarkToggle] Adding bookmark for BibleScreen with anchor: null, book:', anchor?.book, 'chapter:', anchor?.chapter, 'startVerse:', anchor?.startVerse, 'endVerse:', anchor?.endVerse, 'commentaryId:', commentaryId);
          // If anchor includes anchorVerse, use it directly for DI; for BibleScreen use referenceFields
          let bm;
          if (anchor && anchor.anchorVerse) {
            bm = await addBookmark(anchor, commentaryId || null, note, false, null, typeof commentary === 'string' ? commentary : (commentary?.commentary || ''));
          } else {
            bm = await addBookmark(null, commentaryId || null, note, false, {
              book: anchor?.book,
              chapter: anchor?.chapter,
              startVerse: anchor?.startVerse,
              endVerse: anchor?.endVerse
            }, typeof commentary === 'string' ? commentary : (commentary?.commentary || ''));
          }
          setBookmarked(true);
          setBookmarkId(bm.id);
          onChange && onChange(true, bm.id);
          // // console.log('[BookmarkToggle] Bookmark added:', bm);
        }
      }
    } catch (err) {
      setError('Bookmark error: ' + err.message);
      if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.error('[BookmarkToggle] handleToggle error:', err);
    }
    setLoading(false);
  };

  return (
    <>
      {error && (
        <>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#ff5555" style={{ marginRight: 4 }} />
          <Text style={{ color: '#ff5555', fontSize: 12 }}>{error}</Text>
        </>
      )}
      <TouchableOpacity
        onPress={handleToggle}
        disabled={loading}
        style={[{ padding: 8 }, style]}
        accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {loading ? (
          <ActivityIndicator color={iconColorActive || '#ffe066'} size={22} />
        ) : (
          <MaterialCommunityIcons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color={bookmarked
              ? (iconColorActive || iconColorDefault || '#ffe066')
              : (iconColorInactive || iconColorDefault || '#fff')
            }
          />
        )}
      </TouchableOpacity>
    </>
  );
}
