import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, Pressable, Dimensions } from 'react-native';
import NotesEditor from './NotesEditor';
import CustomPickerModal from './CustomPickerModal';
import { ScrollView } from 'react-native';
import { useAuth } from '../auth/useAuth';
import NotesAuthGate from './NotesAuthGate';

// Sorting helpers
const SORT_OPTIONS = [
  { key: 'created_desc', label: 'Newest First' },
  { key: 'created_asc', label: 'Oldest First' },
  { key: 'alpha_asc', label: 'A-Z' },
  { key: 'alpha_desc', label: 'Z-A' },
  // { key: 'custom', label: 'Custom (Drag & Drop)' }, // Disabled due to modal bug
];

// For dev/test: initial notes
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

// Drag-and-drop support (react-native-draggable-flatlist)
import DraggableFlatList from 'react-native-draggable-flatlist';

import PropTypes from 'prop-types';

export default function SortableNotesList({
  notes,
  setNotes,
  openNoteModal,
  onAddNote,
  onEditNote,
  onDeleteNote,
  notesLoading,
  notesError,
  navigation, // optional, for login/signup navigation
}) {
  const { user } = useAuth();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type, args }

  // Helper: require auth before running action
  const requireAuth = (action) => (...args) => {
    if (!user) {
      setPendingAction({ action, args });
      setShowAuthGate(true);
      return;
    }
    action(...args);
  };

  // Wrap note actions
  const handleSave = requireAuth((note, selection) => {
    if (onAddNote) onAddNote(note, selection);
    setInputKey(prev => prev + 1); // Reset the NotesEditor after save
  });

  const handleEdit = requireAuth((note, selection) => {
    if (onEditNote) onEditNote(note, selection);
  });

  const handleDelete = requireAuth((id) => {
    if (onDeleteNote) onDeleteNote(id);
  });

  const handleOpenNote = requireAuth((note) => {
    if (openNoteModal) openNoteModal(note);
  });

  // If user logs in from gate, re-run their action
  const handleAuthGateDismiss = () => {
    setShowAuthGate(false);
    setPendingAction(null);
  };
  const handleAuthGateLogin = () => {
    setShowAuthGate(false);
    if (navigation && navigation.navigate) {
      navigation.navigate('Premium');
    }
    // Optionally: could auto-run pendingAction if user is now logged in
  };

SortableNotesList.propTypes = {
  navigation: PropTypes.object,
};

  // Main state/hooks (declare only once)
  const [sortKey, setSortKey] = useState('created_desc');
  const [inputKey, setInputKey] = useState(0);
  const scrollRef = useRef();



  // Drag handler for custom sorting
  const handleDragEnd = ({ data }) => {
    // console.log(`[SortableNotesList.handleDragEnd] Drag finished at ${new Date().toISOString()}. Data:`, data);
    // console.trace();
    // console.log('[SortableNotesList.handleDragEnd] Creating new note objects to avoid stale references...');
    setNotes(data.map(n => ({ ...n })));
    setTimeout(() => {
      // console.log('[SortableNotesList.handleDragEnd] Notes after setNotes:', data);
    }, 0);
  };

  // Dropdown for sorting controls
  const [showSortModal, setShowSortModal] = useState(false);
  const renderSortDropdown = () => (
    <View style={styles.sortDropdownContainer}>
      <TouchableOpacity
        style={styles.sortDropdown}
        onPress={() => setShowSortModal(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.sortDropdownText}>{SORT_OPTIONS.find(opt => opt.key === sortKey)?.label || 'Sort Notes'}</Text>
      </TouchableOpacity>
      <CustomPickerModal
        visible={showSortModal}
        onRequestClose={() => setShowSortModal(false)}
        options={SORT_OPTIONS.map(opt => ({ label: opt.label, value: opt.key }))}
        selectedValue={sortKey}
        onValueChange={key => {
          setSortKey(key);
          setShowSortModal(false);
        }}
        title="Sort Notes"
      />
    </View>
  );

  // Render a single note card
  const renderNoteCard = ({ item, drag, isActive }) => (
    <TouchableOpacity
      style={[styles.noteCard, isActive && styles.noteCardActive]}
      onLongPress={sortKey === 'custom' ? drag : undefined}
      onPress={() => handleOpenNote(item)}
      activeOpacity={0.88}
      delayLongPress={180}
    >
      {item.selection && item.selection.book && (
        <Text style={styles.anchor}>
          {item.selection.book}
          {item.selection.chapter ? ` ${item.selection.chapter}` : ''}
          {item.selection.verse ? `:${item.selection.verse}` : ''}
          {item.selection.endVerse ? `–${item.selection.endVerse}` : ''}
        </Text>
      )}
      <Text style={styles.noteText}>{item.note}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  // Use DraggableFlatList for drag-and-drop in custom mode only
  if (sortKey === 'custom') {
    return (
      <View style={styles.container}>
        <NotesEditor key={inputKey} onSave={handleSave} />
        <NotesAuthGate visible={showAuthGate} onLoginPress={handleAuthGateLogin} onDismiss={handleAuthGateDismiss} />
        {renderSortDropdown()}
        <DraggableFlatList
          data={notes}
          renderItem={renderNoteCard}
          keyExtractor={item => String(item.timestamp)}
          onDragEnd={handleDragEnd}
          activationDistance={12}
          containerStyle={{ paddingTop: 18, paddingBottom: 64 }}
        />

      </View>
    );
  }

  // Helper: get anchor string for sorting
  function anchorKey(n) {
    if (!n.selection || !n.selection.book) return '\uFFFF'; // Sort notes without anchor last
    let s = n.selection.book;
    if (n.selection.chapter) s += ` ${n.selection.chapter}`;
    if (n.selection.verse) s += `:${n.selection.verse}`;
    if (n.selection.endVerse) s += `–${n.selection.endVerse}`;
    return s;
  }

  // Get sorted notes based on selected method
  function getSortedNotes() {
    if (sortKey === 'created_desc') {
      return [...notes].sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortKey === 'created_asc') {
      return [...notes].sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortKey === 'alpha_asc') {
      return [...notes].sort((a, b) => anchorKey(a).localeCompare(anchorKey(b)));
    } else if (sortKey === 'alpha_desc') {
      return [...notes].sort((a, b) => anchorKey(b).localeCompare(anchorKey(a)));
    } else if (sortKey === 'custom') {
      return notes; // Custom order
    }
    return notes;
  }

  // All other sorts use ScrollView
  return (
    <View style={styles.container}>
      <NotesAuthGate visible={showAuthGate} onLoginPress={handleAuthGateLogin} onDismiss={handleAuthGateDismiss} />
      {renderSortDropdown()}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ alignItems: 'center', paddingTop: 24, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <NotesEditor key={inputKey} onSave={handleSave} />
        {getSortedNotes().map((n, idx) => (
          <TouchableOpacity
            key={n.id || n.timestamp || idx}
            style={styles.noteCard}
            onPress={() => handleOpenNote(n)}
            activeOpacity={0.88}
          >
            {n.selection && n.selection.book && (
              <Text style={styles.anchor}>
                {n.selection.book}
                {n.selection.chapter ? ` ${n.selection.chapter}` : ''}
                {n.selection.verse ? `:${n.selection.verse}` : ''}
                {n.selection.endVerse ? `–${n.selection.endVerse}` : ''}
              </Text>
            )}
            <Text style={styles.noteText}>{n.note}</Text>
            <Text style={styles.timestamp}>{
  n.created_at
    ? new Date(n.created_at).toLocaleString()
    : n.timestamp
      ? new Date(n.timestamp).toLocaleString()
      : ''
}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  sortDropdownContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  sortDropdown: {
    backgroundColor: '#f5e4c3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: '#bfae66',
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    elevation: 2,
  },
  sortDropdownText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'serif',
    letterSpacing: 0.2,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    paddingBottom: 12,
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
  },
  sortBtn: {
    backgroundColor: '#f5e4c3',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 13,
    marginHorizontal: 3,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#bfae66',
  },
  sortBtnActive: {
    backgroundColor: '#ffe066',
    borderColor: '#3D0066',
  },
  sortBtnText: {
    color: '#3D0066',
    fontWeight: '500',
    fontSize: 15,
    fontFamily: 'serif',
  },
  sortBtnTextActive: {
    color: '#2A004B',
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  noteCard: {
    backgroundColor: '#fffbe6',
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
    borderColor: '#d1b866',
    elevation: 4,
  },
  noteCardActive: {
    backgroundColor: '#ffe066',
    borderColor: '#3D0066',
    shadowOpacity: 0.22,
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
    color: '#20003a',
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
