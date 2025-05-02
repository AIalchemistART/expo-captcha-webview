import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NotesEditor from './NotesEditor';
import { getVerse } from '../utils/bibleText';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const modalWidth = Math.min(screenWidth * 0.92, 480);

export default function GlobalNoteModal({
  modalInstanceKey,
  modalVisible,
  selectedNote,
  isEditing,
  onClose,
  onEdit,
  onEditSave,
  onDismiss,
  onDelete, // <-- add this prop
}) {
  // ULTRA-VERBOSE LOGGING: Every render
  // console.log('[GlobalNoteModal][RENDER] modalVisible:', modalVisible, 'isEditing:', isEditing, 'selectedNote:', selectedNote, 'modalInstanceKey:', modalInstanceKey, 'props:', {modalVisible, isEditing, selectedNote, modalInstanceKey});
  // Log pointerEvents on every render
  setTimeout(() => {
    try {
      const overlay = document.querySelector('[data-testid="global-note-modal-overlay"]');
      if (overlay) {
        console.log('[GlobalNoteModal][RENDER] overlay pointerEvents:', overlay.style.pointerEvents);
      }
    } catch(e) {}
  }, 0);
  // Log stack trace on every render
  console.log('[GlobalNoteModal][RENDER][STACK]', new Error().stack);

  React.useEffect(() => {
    console.log('[GlobalNoteModal][State] modalVisible:', modalVisible);
  }, [modalVisible]);
  React.useEffect(() => {
    console.log('[GlobalNoteModal][State] selectedNote:', selectedNote);
  }, [selectedNote]);
  React.useEffect(() => {
    console.log('[GlobalNoteModal][State] isEditing:', isEditing);
  }, [isEditing]);
  React.useEffect(() => {
    console.log('[GlobalNoteModal][State] props changed:', { modalVisible, selectedNote, isEditing });
  }, [modalVisible, selectedNote, isEditing]);


  console.log('[GlobalNoteModal] selectedNote:', selectedNote);
  if (!modalVisible) {
    return null;
  }
  console.log('[GlobalNoteModal] Passing key to native Modal:', modalInstanceKey);
  return (
    <Modal
      key={modalInstanceKey}
      visible={modalVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      onDismiss={onDismiss}
    >
      <View
        style={styles.overlay}
        pointerEvents="auto"
        onLayout={e => {
          const {x, y, width, height} = e.nativeEvent.layout;
          console.log('[GlobalNoteModal][Overlay] pointerEvents:', styles.overlay.pointerEvents);
          if (width === 0 || height === 0) {
            console.log('[GlobalNoteModal][Parent Overlay Layout] Fallback: using static screen dimensions', screenWidth, screenHeight);
          } else {
            console.log('[GlobalNoteModal][Parent Overlay Layout] x:', x, 'y:', y, 'width:', width, 'height:', height);
          }
        }}
      >
        <View
          style={styles.modalContent}
          pointerEvents="auto"
          onLayout={e => {
            const {x, y, width, height} = e.nativeEvent.layout;
            console.log('[GlobalNoteModal][Modal Content Layout] x:', x, 'y:', y, 'width:', width, 'height:', height);
          }}
        >
          {/* Trashcan delete button, top right */}
          {selectedNote && !isEditing && onDelete && (
            <TouchableOpacity
              style={styles.trashBtn}
              onPress={() => onDelete(selectedNote.id)}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={28} color="#d7263d" />
            </TouchableOpacity>
          )}
          {selectedNote && !isEditing && (
            <ScrollView contentContainerStyle={styles.scrollContent} style={{width: '100%'}}>
              <Text style={styles.title}>Note Details</Text>
              {/* Show passage only if a verse or passage is referenced */}
              {(() => {
                const sel = selectedNote.selection;
                if (!sel || !sel.book) return null;
                // Always show a heading summarizing the selection
                let heading = sel.book;
                if (sel.chapter) heading += ` ${sel.chapter}`;
                if (sel.verse && sel.endVerse) {
                  heading += `:${sel.verse}-${sel.endVerse}`;
                } else if (sel.verse) {
                  heading += `:${sel.verse}`;
                } else if (sel.startVerse && sel.endVerse) {
                  heading += `:${sel.startVerse}-${sel.endVerse}`;
                } else if (sel.startVerse) {
                  heading += `:${sel.startVerse}`;
                } else if (sel.endVerse) {
                  heading += `:${sel.endVerse}`;
                }
                let verses = [];
                // Render all verses in the selected range, if present
                if ((sel.verse && sel.endVerse)) {
                  for (let v = Number(sel.verse); v <= Number(sel.endVerse); v++) {
                    const text = getVerse(sel.book, sel.chapter, v);
                    if (text) verses.push(`${v}. ${text}`);
                  }
                } else if (sel.startVerse && sel.endVerse) {
                  for (let v = Number(sel.startVerse); v <= Number(sel.endVerse); v++) {
                    const text = getVerse(sel.book, sel.chapter, v);
                    if (text) verses.push(`${v}. ${text}`);
                  }
                } else if (sel.verse) {
                  const text = getVerse(sel.book, sel.chapter, sel.verse);
                  if (text) verses.push(`${sel.verse}. ${text}`);
                } else if (sel.startVerse) {
                  const text = getVerse(sel.book, sel.chapter, sel.startVerse);
                  if (text) verses.push(`${sel.startVerse}. ${text}`);
                } else if (sel.endVerse) {
                  const text = getVerse(sel.book, sel.chapter, sel.endVerse);
                  if (text) verses.push(`${sel.endVerse}. ${text}`);
                }
                return (
                  <View style={{width: '100%', alignItems: 'center', marginBottom: 8}}>
                    <Text style={styles.anchor}>{heading}</Text>
                    {verses.length > 0 && verses.map((t, i) => {
                      const match = t.match(/^(\d+)\.\s*(.*)$/);
                      if (match) {
                        return (
                          <Text key={i} style={styles.passageText}>
                            <Text style={styles.verseNum}>{match[1]}</Text>{' '}{match[2]}
                          </Text>
                        );
                      } else {
                        return <Text key={i} style={styles.passageText}>{t}</Text>;
                      }
                    })}
                  </View>
                );
              })()}
              <Text style={styles.noteHeading}>Your Note</Text>
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>{selectedNote.note}</Text>
              </View>
              <View style={styles.buttonRow}>
                <Pressable onPress={() => {
                  console.log('[GlobalNoteModal][Button] Edit pressed');
                  console.log('[GlobalNoteModal][Button][STACK][Edit]', new Error().stack);
                  onEdit();
                  setTimeout(() => {
                    console.log('[GlobalNoteModal][Button] After Edit: modalVisible:', modalVisible, 'isEditing:', isEditing, 'selectedNote:', selectedNote);
                  }, 0);
                }} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => {
                  console.log('[GlobalNoteModal][Button] Close pressed');
                  console.log('[GlobalNoteModal][Button][STACK][Close]', new Error().stack);
                  onClose();
                  setTimeout(() => {
                    console.log('[GlobalNoteModal][Button] After Close: modalVisible:', modalVisible, 'isEditing:', isEditing, 'selectedNote:', selectedNote);
                  }, 0);
                }} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
          {isEditing && selectedNote && (
            <NotesEditor
              key={selectedNote.timestamp}
              initialNote={selectedNote.note}
              initialSelection={selectedNote.selection}
              onSave={onEditSave}
              onCancel={onClose}
              editMode
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  passageText: {
    color: '#3D0066',
    fontSize: 16,
    marginBottom: 2,
    fontFamily: 'serif',
    textAlign: 'center',
  },
  verseNum: {
    fontWeight: 'bold',
    color: '#3D0066',
    fontSize: 16,
  },
  noteHeading: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#6B1A7A',
    marginBottom: 6,
    marginTop: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: '#fff8fa',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    alignSelf: 'center',
  },
  noteText: {
    fontSize: 17,
    color: '#222',
    fontFamily: 'serif',
    textAlign: 'center',
    lineHeight: 24,
  },
  trashBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 22,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 0, 36, 0.87)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 10,
  },
  modalContent: {
    backgroundColor: '#fffbe6',
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: modalWidth,
    maxWidth: 480,
    pointerEvents: 'auto',
  },
  title: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  noteText: {
    color: '#3D0066',
    fontSize: 16,
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 18,
  },
  editBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    marginRight: 10,
  },
  editBtnText: {
    color: '#fffbe6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: '#ffe066',
    borderRadius: 16,
  },
  closeBtnText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
