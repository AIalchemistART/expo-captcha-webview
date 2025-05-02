import React, { useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Animated } from 'react-native';
import NotesEditor from './NotesEditor';

/**
 * NotesList: Displays a scrollable list of notes, always centering the newest note after save.
 * Notes are stored in local state. Each note may have an optional passage anchor.
 */
// Set to true for local dev/test only. NEVER enable in production!
const DEV_MODE = true;
const DEV_NOTES = [
  { note: 'Mystical insight on Genesis 1:1', selection: { book: 'Genesis', chapter: 1, verse: 1 }, timestamp: Date.now() - 10000 },
  { note: 'Dreams and visions from Daniel 7', selection: { book: 'Daniel', chapter: 7 }, timestamp: Date.now() - 9000 },
  { note: 'Psalm 23 brings comfort', selection: { book: 'Psalms', chapter: 23 }, timestamp: Date.now() - 8000 },
  { note: 'Matthew 5:9 – Peacemakers', selection: { book: 'Matthew', chapter: 5, verse: 9 }, timestamp: Date.now() - 7000 },
  { note: 'Wisdom from Proverbs 3', selection: { book: 'Proverbs', chapter: 3 }, timestamp: Date.now() - 6000 },
  { note: 'Apocrypha: Sirach 2', selection: { book: 'Sirach', chapter: 2 }, timestamp: Date.now() - 5000 },
  { note: 'Ephesians 6: Armor of God', selection: { book: 'Ephesians', chapter: 6 }, timestamp: Date.now() - 4000 },
  { note: 'Isaiah 40:31 – Renewed strength', selection: { book: 'Isaiah', chapter: 40, verse: 31 }, timestamp: Date.now() - 3000 },
  { note: 'Revelation 21: New creation', selection: { book: 'Revelation', chapter: 21 }, timestamp: Date.now() - 2000 },
  { note: 'Baruch: Exile and hope', selection: { book: 'Baruch', chapter: 1 }, timestamp: Date.now() - 1000 },
];

export default function NotesList() {
  const [notes, setNotes] = React.useState(DEV_MODE ? [...DEV_NOTES] : []); // { note, selection, timestamp }
  const scrollRef = React.useRef();
  const [inputKey, setInputKey] = React.useState(0); // To reset the NotesEditor

  // Save a new note and scroll to center it
  const handleSave = (note, selection) => {
    if (!note || note.trim() === '') return;
    const timestamp = Date.now();
    setNotes(prev => [{ note, selection, timestamp }, ...prev]);
    setInputKey(k => k + 1); // Reset NotesEditor
    setTimeout(() => {
      if (scrollRef.current && notes.length > 0) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    }, 400); // Wait for layout
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ alignItems: 'center', paddingTop: 24, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', alignItems: 'center', marginBottom: 32 }}>
          <NotesEditor key={inputKey} onSave={handleSave} />
        </View>
        {notes.map((n, idx) => (
          <View key={n.timestamp} style={styles.noteCard}>
            {n.selection && n.selection.book && (
              <Text style={styles.anchor}>
                {n.selection.book}
                {n.selection.chapter ? ` ${n.selection.chapter}` : ''}
                {n.selection.verse ? `:${n.selection.verse}` : ''}
                {n.selection.endVerse ? `–${n.selection.endVerse}` : ''}
              </Text>
            )}
            <Text style={styles.noteText}>{n.note}</Text>
            <Text style={styles.timestamp}>{new Date(n.timestamp).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  noteCard: {
    backgroundColor: '#fffbe6', // parchment-like, high contrast
    borderRadius: 16,
    marginBottom: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    width: '96%',
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1b866', // gold accent
    elevation: 4,
  },
  anchor: {
    color: '#2A004B',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  noteText: {
    color: '#20003a', // deep mystical purple, high contrast
    fontSize: 18,
    fontFamily: 'serif',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  timestamp: {
    color: '#bfae66',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
