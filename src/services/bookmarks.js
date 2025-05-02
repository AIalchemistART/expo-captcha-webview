// services/bookmarks.js
// Handles bookmark CRUD for Mystical Bible Companion (Supabase-backed)
import { supabase } from './supabaseClient';
import { getUserId } from './notes'; // Assumes getUserId returns logged-in user's id

// Add a bookmark for a passage
// Add a bookmark for a passage; if fromBibleScreen is true, anchor and passage columns will be null
// commentary_id refers to the commentary record (not commentary text)
// referenceFields: { book, chapter, startVerse, endVerse } (optional, used if anchor is null)
export async function addBookmark(anchor, commentary_id = null, note = '', fromBibleScreen = false, referenceFields = null, commentary = null) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('Bookmarks are a premium feature. Please sign in and upgrade to premium to save bookmarks.');
  let book = null, chapter = null, start_verse = null, end_verse = null;
  if (anchor) {
    book = anchor.book ?? null;
    chapter = anchor.chapter ?? null;
    start_verse = anchor.startVerse ?? null;
    end_verse = anchor.endVerse ?? null;
  } else if (referenceFields) {
    book = referenceFields.book ?? null;
    chapter = referenceFields.chapter ?? null;
    start_verse = referenceFields.startVerse ?? null;
    end_verse = referenceFields.endVerse ?? null;
  }
  // Check for existing bookmark for this user/passage
  const { data: existing, error: fetchError } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user_id)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('start_verse', start_verse)
    .eq('end_verse', end_verse)
    .maybeSingle();
  if (fetchError) {
    console.error('[addBookmark] Error checking for existing bookmark:', fetchError);
    throw fetchError;
  }
  if (existing) {
    // Update existing bookmark
    const updateFields = {
      note,
      commentary,
      commentary_id,
      anchor: anchor || null,
      book,
      chapter,
      start_verse,
      end_verse,
      // fromBibleScreen removed: not in DB schema
      // Do not update created_at
    };
    const updated = await updateBookmark(existing.id, updateFields);
    // console.log('[addBookmark] Updated existing bookmark:', updated);
    return updated;
  } else {
    // Insert new bookmark
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ user_id, anchor: anchor || null, book, chapter, start_verse, end_verse, commentary_id, commentary, note, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) {
      console.error('[addBookmark] Supabase error:', error);
      throw error;
    }
    // console.log('[addBookmark] Inserted new:', data);
    return data;
  }
}

// Update a bookmark by id (only updates provided fields)
export async function updateBookmark(id, fields) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('Bookmarks are a premium feature. Please sign in and upgrade to premium to save bookmarks.');
  if (!id) throw new Error('Bookmark id required');
  const { data, error } = await supabase
    .from('bookmarks')
    .update({ ...fields })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();
  if (error) {
    console.error('[updateBookmark] Supabase error:', error);
    throw error;
  }
  return data;
}

// Remove a bookmark by id
export async function deleteBookmark(id) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('Bookmarks are a premium feature. Please sign in and upgrade to premium to save bookmarks.');
  console.log('[deleteBookmark] deleting:', { id, user_id });
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);
  if (error) {
    console.error('[deleteBookmark] Supabase error:', error);
    throw error;
  }
  console.log('[deleteBookmark] Deleted:', id);
}

// Fetch all bookmarks for the current user
export async function fetchBookmarks() {
  const user_id = await getUserId();
  if (!user_id) throw new Error('Bookmarks are a premium feature. Please sign in and upgrade to premium to save bookmarks.');
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[fetchBookmarks] Supabase error:', error);
    throw error;
  }
  // console.log('[fetchBookmarks] found:', data?.length || 0);
  return data || [];
}

// Check if a passage is bookmarked (by anchor fields)
export async function isBookmarked(anchor) {
  const user_id = await getUserId();
  if (!user_id) return false;
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id, anchor')
    .eq('user_id', user_id);
  if (error) throw error;
  if (!data) return false;
  const match = data.find(bm =>
    bm.anchor &&
    bm.anchor.book === anchor.book &&
    bm.anchor.chapter === anchor.chapter &&
    bm.anchor.startVerse === anchor.startVerse &&
    bm.anchor.endVerse === anchor.endVerse
  );
  return !!match;
}
