import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BookmarkEditor from './BookmarkEditor';
import RemoveBookmarkModal from './RemoveBookmarkModal';
import { getVerse } from '../utils/bibleText';
import { updateBookmark } from '../services/bookmarks';

const screenWidth = Dimensions.get('window').width;
const modalWidth = Math.min(screenWidth * 0.92, 480);

export default function BookmarkModal({
  visible,
  bookmark,
  onClose,
  onEdit,
  onEditSave,
  onRemove,
  isEditing,
  loading,
}) {
  const [removing, setRemoving] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  if (!visible || !bookmark) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Remove (bookmark) button, top right */}
          {!isEditing && (
            <>
              <TouchableOpacity
                style={styles.bookmarkBtn}
                onPress={() => setShowRemoveModal(true)}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                accessibilityLabel="Remove bookmark"
                disabled={removing || loading}
              >
                {removing || loading ? (
                  <ActivityIndicator color="#d7263d" size={28} />
                ) : (
                  <MaterialCommunityIcons name="bookmark-remove-outline" size={28} color="#d7263d" />
                )}
              </TouchableOpacity>
              <RemoveBookmarkModal
                visible={showRemoveModal}
                loading={removing || loading}
                onCancel={() => setShowRemoveModal(false)}
                onConfirm={async () => {
                  setRemoving(true);
                  await onRemove(bookmark.id);
                  setRemoving(false);
                  setShowRemoveModal(false);
                }}
              />
            </>
          )}
          {/* Main content: reference, commentary, note */}
          {!isEditing && (
            <ScrollView contentContainerStyle={styles.scrollContent} style={{width: '100%'}}>
              <Text style={styles.title}>Bookmark Details</Text>
              <Text style={styles.anchorText}>
                {(() => {
                  const book = bookmark.anchor?.book || bookmark.book || '';
                  const chapter = bookmark.anchor?.chapter || bookmark.chapter || '';
                  const start = bookmark.anchor?.startVerse || bookmark.start_verse || '';
                  const end = bookmark.anchor?.endVerse || bookmark.end_verse || '';
                  let ref = `${book} ${chapter}`;
                  if (start) {
                    ref += `:${start}`;
                  }
                  // Only show range if end != start and end is defined
                  if (end && end !== start) {
                    ref += `-${end}`;
                  }
                  // Show (Focus: anchorVerse) if present
                  const focus = bookmark.anchor?.anchorVerse || bookmark.focus_verse;
                  if (focus) {
                    ref += ` (Focus: ${focus})`;
                  }
                  return ref;
                })()}
              </Text>
              {/* Render Inspiration Verse above referenced verses for DI bookmarks */}
              {(() => {
                const anchorVerse = bookmark.anchor?.anchorVerse;
                const book = bookmark.anchor?.book || bookmark.book || '';
                const chapter = bookmark.anchor?.chapter || bookmark.chapter || '';
                let inspiration = null;
                if (anchorVerse && book && chapter) {
                  const verseText = getVerse(book, chapter, anchorVerse);
                  if (verseText) {
                    inspiration = (
                      <View style={{width: '100%', alignItems: 'center', marginBottom: 8}}>
                        <Text style={styles.mysticalHeading}>Inspiration Verse</Text>
                        <Text style={styles.verseLine}>{anchorVerse}. {verseText}</Text>
                      </View>
                    );
                  }
                }
                return inspiration;
              })()}
              {/* Contextual Illumination or Passage heading above referenced verses */}
              {bookmark.anchor?.anchorVerse ? (
                <Text style={styles.mysticalHeading}>Contextual Illumination</Text>
              ) : (
                <Text style={styles.mysticalHeading}>Passage</Text>
              )}
              {/* Render referenced verse(s) above commentary */}
              {(() => {
                const book = bookmark.anchor?.book || bookmark.book || '';
                const chapter = bookmark.anchor?.chapter || bookmark.chapter || '';
                const start = Number(bookmark.anchor?.startVerse || bookmark.start_verse || '');
                const end = Number(bookmark.anchor?.endVerse || bookmark.end_verse || start);
                if (!book || !chapter || !start) return null;
                const verses = [];
                for (let v = start; v <= (end && end !== start ? end : start); ++v) {
                  const text = getVerse(book, chapter, v);
                  if (text) {
                    verses.push(
                      <Text key={v} style={styles.verseLine}>
                        <Text style={styles.verseNum}>{v} </Text>
                        {text}
                      </Text>
                    );
                  }
                }
                return (
                  <View style={styles.verseBlock}>{verses}</View>
                );
              })()}
              {bookmark.commentary ? (
                <>
                  <Text style={styles.mysticalHeading}>Mystical Interpretation</Text>
                  <Text style={styles.commentary}>{bookmark.commentary}</Text>
                </>
              ) : null}
              {bookmark.note ? (
                <>
                  <Text style={styles.noteHeading}>Note</Text>
                  <Text style={styles.noteText}>{bookmark.note}</Text>
                </>
              ) : null}
              {bookmark.created_at && (
                <Text style={styles.timestamp}>{new Date(bookmark.created_at).toLocaleString()}</Text>
              )}
              <View style={styles.buttonRow}>
                <Pressable onPress={onEdit} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
          {isEditing && (
            <BookmarkEditor
              commentary={bookmark.commentary}
              anchor={bookmark.anchor || {
                book: bookmark.book,
                chapter: bookmark.chapter,
                startVerse: bookmark.start_verse,
                endVerse: bookmark.end_verse
              }}
              initialNote={bookmark.note}
              onSave={async (newNote) => {
                if (!bookmark.id) return;
                await updateBookmark(bookmark.id, { note: newNote });
                if (typeof onEditSave === 'function') onEditSave(newNote);
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  },
  bookmarkBtn: {
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  anchorText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  mysticalHeading: {
    color: '#6B1A7A',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: 'serif',
    textShadowColor: '#ffe066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  commentary: {
    color: '#20003a',
    fontSize: 18,
    fontFamily: 'serif',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  verseBlock: {
    marginBottom: 10,
    marginTop: 4,
    backgroundColor: '#f8f3e0',
    borderRadius: 8,
    padding: 8,
    width: '100%',
  },
  verseLine: {
    color: '#3D0066',
    fontSize: 16,
    fontFamily: 'serif',
    marginBottom: 2,
    textAlign: 'left',
  },
  verseNum: {
    fontWeight: 'bold',
    color: '#bfae66',
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
  noteText: {
    fontSize: 17,
    color: '#222',
    fontFamily: 'serif',
    textAlign: 'center',
    lineHeight: 24,
  },
  timestamp: {
    color: '#bfae66',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 14,
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
