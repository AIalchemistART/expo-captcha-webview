import { supabase } from './supabaseClient';

// Returns the authenticated user's id, or null if not logged in
export async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) { Sentry.captureException(); } // console.warn('[getUserId] No authenticated user.', error);
    return null;
  }
  // console.log('[getUserId] user.id:', data.user.id);
  return data.user.id;
}

// Fetch all notes for the current user
export async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Add a new note
export async function addNote(note, selection) {
  // console.log('[addNote] called with:', { note, selection });
  // Get current user (SDK v2+)
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  // console.log('[addNote] user:', user, 'userError:', userError);
  if (userError || !user) {
    console.error('[addNote] No authenticated user.');
    throw new Error('User must be authenticated to save notes');
  }

  const insertObj = { note, selection, user_id: user.id };
  // console.log('[addNote] inserting:', insertObj);
  const { data, error } = await supabase
    .from('notes')
    .insert([insertObj])
    .select()
    .single();
  if (error) {
    console.error('[addNote] Supabase error:', error);
    throw error;
  }
  // console.log('[addNote] Inserted note:', data);
  return data;
}

// Update a note
export async function updateNote(id, note, selection) {
  const { data, error } = await supabase
    .from('notes')
    .update({ note, selection })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete a note
export async function deleteNote(id) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
