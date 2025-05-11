import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';

const API_URL = 'https://mbc-backend-quj9.onrender.com/api/llm-contextual-passage';

export default function DevGetInspired() {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) return null;

  const [book, setBook] = useState('Genesis');
  const [chapter, setChapter] = useState('1');
  const [startVerse, setStartVerse] = useState('1');
  const [endVerse, setEndVerse] = useState('1');
  const [anchorVerse, setAnchorVerse] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetInspired = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const body = {
        book: book.trim(),
        chapter: Number(chapter),
        startVerse: Number(startVerse),
        endVerse: Number(endVerse)
      };
      if (anchorVerse.trim()) body.anchorVerse = Number(anchorVerse);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        // Insert into Supabase commentaries table
        const insertObj = {
          is_reviewed: false,
          commentary: data.commentary || data.result || '',
          book: data.book,
          chapter: data.chapter,
          start_verse: data.startVerse ?? data.start_verse ?? body.startVerse,
          end_verse: data.endVerse ?? data.end_verse ?? body.endVerse,
          anchor_verse: data.anchorVerse ?? data.anchor_verse ?? (body.anchorVerse || null),
          s3_urls: data.s3_urls || {},
        };
        const { error: insertError } = await supabase.from('commentaries').insert([insertObj]);
        if (insertError) {
          setError('Supabase insert error: ' + insertError.message);
        } else {
          setResult({ ...data, supabase: 'Inserted successfully!' });
        }
      } else {
        setError(data?.error || 'Unknown error');
      }
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dev Get Inspired Query</Text>
      <View style={styles.row}><Text>Book:</Text><TextInput style={styles.input} value={book} onChangeText={setBook} /></View>
      <View style={styles.row}><Text>Chapter:</Text><TextInput style={styles.input} value={chapter} onChangeText={setChapter} keyboardType="numeric" /></View>
      <View style={styles.row}><Text>Start Verse:</Text><TextInput style={styles.input} value={startVerse} onChangeText={setStartVerse} keyboardType="numeric" /></View>
      <View style={styles.row}><Text>End Verse:</Text><TextInput style={styles.input} value={endVerse} onChangeText={setEndVerse} keyboardType="numeric" /></View>
      <View style={styles.row}><Text>Anchor Verse (optional):</Text><TextInput style={styles.input} value={anchorVerse} onChangeText={setAnchorVerse} keyboardType="numeric" /></View>
      <Button title={loading ? 'Loading...' : 'Get Inspired'} onPress={handleGetInspired} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Result:</Text>
          <Text selectable style={styles.resultText}>{JSON.stringify(result, null, 2)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(42,0,75,0.92)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'gold',
    padding: 16,
    marginTop: 48,
    marginHorizontal: 18,
    marginBottom: 12,
    shadowColor: '#2A004B',
    shadowOpacity: 0.33,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: 'gold',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    fontFamily: 'serif',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ffe066',
    borderRadius: 6,
    padding: 5,
    marginLeft: 6,
    minWidth: 52,
    color: '#ffe066',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  error: {
    color: '#ff5252',
    marginTop: 8,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 8,
    marginTop: 12,
    maxHeight: 180,
  },
  resultTitle: {
    color: 'gold',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultText: {
    color: '#ffe066',
    fontFamily: 'serif',
    fontSize: 13,
  },
});
