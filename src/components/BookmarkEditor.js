import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const BookmarkEditor = ({ commentary, anchor, initialNote = '', onSave }) => {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(note);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.anchorText}>
        {anchor ? `${anchor.book} ${anchor.chapter}:${anchor.startVerse}${anchor.endVerse && anchor.endVerse !== anchor.startVerse ? '-' + anchor.endVerse : ''}` : ''}
      </Text>
      <Text style={styles.commentary}>{commentary}</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Add a note about this commentary..."
        placeholderTextColor="#6B1A7A"
        value={note}
        onChangeText={setNote}
        multiline
      />
      <TouchableOpacity
        style={{
          marginTop: 16,
          backgroundColor: '#ffe066',
          paddingVertical: 10,
          borderRadius: 10,
          alignItems: 'center',
          opacity: saving ? 0.7 : 1,
        }}
        onPress={handleSave}
        disabled={saving}
        accessibilityLabel="Save Note"
      >
        <Text style={{ color: '#3D0066', fontWeight: 'bold', fontSize: 16 }}>
          {saving ? 'Saving...' : 'Save Note'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
    padding: 12,
    backgroundColor: '#fffbe6', // parchment background for strong contrast
    borderRadius: 14,
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  anchorText: {
    color: '#bfae66', // gold accent
    fontSize: 15,
    fontFamily: 'serif',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  commentary: {
    color: '#3D0066', // mystical purple for commentary
    fontSize: 16,
    fontFamily: 'serif',
    marginBottom: 8,
    textAlign: 'center',
  },
  textInput: {
    minHeight: 60,
    fontSize: 16,
    color: '#2A004B', // deep mystical purple for strong contrast
    fontFamily: 'serif',
    backgroundColor: '#fff', // white for max contrast
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#bfae66', // gold accent border
    marginBottom: 8,
  },
});

export default BookmarkEditor;
