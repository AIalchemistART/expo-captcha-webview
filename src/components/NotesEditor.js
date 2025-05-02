import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CustomPickerModal from './CustomPickerModal';
import { BIBLE_STRUCTURE } from '../utils/bibleStructure';

const NotesEditor = ({ initialNote = '', onSave, initialSelection = null }) => {
  const [note, setNote] = useState(initialNote);
  const [showPicker, setShowPicker] = useState(false);
  const [selection, setSelection] = useState(initialSelection);


  // Book sections for overlay
  const OLD_TESTAMENT = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
    'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
    'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];
  const NEW_TESTAMENT = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
    'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
    'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];
  const APOCRYPHA = [
    'Tobit', 'Judith', 'Esther (Greek)', 'Wisdom of Solomon', 'Sirach', 'Baruch', 'Letter of Jeremiah',
    'Song of the Three Young Men', 'Susanna', 'Bel and the Dragon', 'Prayer of Manasseh',
    'Psalm 151', 'Odes', 'Psalms (Extra)', '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees', 'Ezra (Greek)'
  ];

  // Sectioned book options for picker
  const bookOptions = [
    { label: 'Old Testament', type: 'label' },
    ...OLD_TESTAMENT.filter(b => BIBLE_STRUCTURE[b]).map(book => ({ label: book, value: book, type: 'book' })),
    { label: 'New Testament', type: 'label' },
    ...NEW_TESTAMENT.filter(b => BIBLE_STRUCTURE[b]).map(book => ({ label: book, value: book, type: 'book' })),
    { label: 'Apocrypha & Deuterocanonical Books', type: 'label' },
    ...APOCRYPHA.filter(b => BIBLE_STRUCTURE[b]).map(book => ({ label: book, value: book, type: 'book' })),
  ];

  // Generate chapter options based on selected book
  const chapterOptions = selection?.book
    ? Array.from({ length: BIBLE_STRUCTURE[selection.book].chapters }, (_, i) => ({
        label: `Chapter ${i + 1}`,
        value: i + 1
      }))
    : [];

  // Generate verse options based on selected book and chapter
  const verseOptions = selection?.book && selection?.chapter
    ? Array.from({ length: BIBLE_STRUCTURE[selection.book].verses[selection.chapter - 1] }, (_, i) => ({
        label: `Verse ${i + 1}`,
        value: i + 1
      }))
    : [];

  // Generate end verse options (for passage range)
  const endVerseOptions = selection?.book && selection?.chapter && selection?.verse
    ? Array.from({
        length: BIBLE_STRUCTURE[selection.book].verses[selection.chapter - 1] - (selection.verse - 1)
      }, (_, i) => ({
        label: `Verse ${selection.verse + i}`,
        value: selection.verse + i
      }))
    : [];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowPicker('book')}>
        <Text style={styles.toggleText}>{selection?.book ? selection.book : 'Select Book (optional)'}</Text>
      </TouchableOpacity>
      <CustomPickerModal
        visible={showPicker === 'book'}
        onRequestClose={() => setShowPicker(false)}
        options={bookOptions}
        selectedValue={selection?.book}
        onValueChange={book => {
          setSelection({ book, chapter: undefined, verse: undefined, endVerse: undefined });
          setShowPicker(false);
        }}
        title="Select Book"
        renderOption={opt =>
          opt.type === 'label' ? (
            <Text style={{ fontWeight: 'bold', color: '#bfae66', fontSize: 16, marginVertical: 8 }}>{opt.label}</Text>
          ) : undefined
        }
      />
      {selection?.book && (
        <>
          <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowPicker('chapter')}>
            <Text style={styles.toggleText}>{selection?.chapter ? `Chapter ${selection.chapter}` : 'Select Chapter'}</Text>
          </TouchableOpacity>
          <CustomPickerModal
            visible={showPicker === 'chapter'}
            onRequestClose={() => setShowPicker(false)}
            options={chapterOptions}
            selectedValue={selection?.chapter}
            onValueChange={chapter => {
              setSelection({ ...selection, chapter, verse: undefined });
              setShowPicker(false);
            }}
            title="Select Chapter"
          />
        </>
      )}
      {selection?.book && selection?.chapter && (
        <>
          <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowPicker('verse')}>
            <Text style={styles.toggleText}>{selection?.verse ? `Verse ${selection.verse}` : 'Select Verse'}</Text>
          </TouchableOpacity>
          <CustomPickerModal
            visible={showPicker === 'verse'}
            onRequestClose={() => setShowPicker(false)}
            options={verseOptions}
            selectedValue={selection?.verse}
            onValueChange={verse => {
              setSelection({ ...selection, verse, endVerse: undefined });
              setShowPicker(false);
            }}
            title="Select Verse"
          />
          {/* Optional end verse picker for passage range */}
          {selection.verse && (
            <>
              <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowPicker('endVerse')}>
                <Text style={styles.toggleText}>{selection?.endVerse ? `End Verse ${selection.endVerse}` : 'Select End Verse (optional)'}</Text>
              </TouchableOpacity>
              <CustomPickerModal
                visible={showPicker === 'endVerse'}
                onRequestClose={() => setShowPicker(false)}
                options={endVerseOptions}
                selectedValue={selection?.endVerse}
                onValueChange={endVerse => {
                  setSelection({ ...selection, endVerse });
                  setShowPicker(false);
                }}
                title="Select End Verse"
              />
            </>
          )}
        </>
      )}
      <TextInput
        style={styles.textInput}
        placeholder="Write your note..."
        placeholderTextColor="#bba"
        value={note}
        onChangeText={setNote}
        multiline
      />
      <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(note, selection)}>
        <Text style={styles.saveText}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
    padding: 14,
    backgroundColor: '#f5e4c3', // parchment color
    borderRadius: 16,
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  textInput: {
    minHeight: 80,
    fontSize: 17,
    color: '#3D0066', // deep purple for contrast
    fontFamily: 'serif',
    backgroundColor: '#fffbe6', // lighter parchment for writing area
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#bfae66',
    shadowColor: '#bfae66',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  toggleBtn: {
    backgroundColor: '#3D0066',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  toggleText: {
    color: '#ffe066',
    fontSize: 15,
    fontFamily: 'serif',
  },
  saveBtn: {
    backgroundColor: '#ffe066',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'serif',
  },
});

export default NotesEditor;
