import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const COMMENTARY_FILE = FileSystem.documentDirectory + 'localCommentaries.json';

export default function DevCommentarySync() {
  const [commentaries, setCommentaries] = useState(null);
  const [status, setStatus] = useState('');

  // Export all local commentaries to a JSON file
  const exportCommentaries = async () => {
    setStatus('Exporting...');
    try {
      const keys = await AsyncStorage.getAllKeys();
      const commentaryKeys = keys.filter(k => k.startsWith('commentary:'));
      const entries = await AsyncStorage.multiGet(commentaryKeys);
      const data = {};
      entries.forEach(([key, value]) => {
        data[key] = value;
      });
      await FileSystem.writeAsStringAsync(COMMENTARY_FILE, JSON.stringify(data, null, 2));
      setCommentaries(data);
      setStatus('Exported to localCommentaries.json in app document directory.');
    } catch (err) {
      setStatus('Export failed: ' + err.message);
    }
  };

  // Import commentaries from the JSON file and write to AsyncStorage
  const handleImportFromFile = async () => {
    setStatus('Importing from file...');
    try {
      const fileUri = FileSystem.documentDirectory + 'localCommentaries.json';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        setStatus('No local commentary file found to import. Please export first or place a valid file in the app\'s local storage.');
        return;
      }
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsed = JSON.parse(fileContent);
      const entries = Object.entries(parsed);
      await AsyncStorage.multiSet(entries);
      setStatus('Imported from file successfully.');
      setCommentaries(parsed);
    } catch (err) {
      setStatus('Import failed: ' + err);
    }
  };

  // For dev: view all local commentaries
  const viewCommentaries = async () => {
    setStatus('Loading...');
    try {
      const keys = await AsyncStorage.getAllKeys();
      const commentaryKeys = keys.filter(k => k.startsWith('commentary:'));
      const entries = await AsyncStorage.multiGet(commentaryKeys);
      const data = {};
      entries.forEach(([key, value]) => {
        data[key] = value;
      });
      setCommentaries(data);
      setStatus('Loaded ' + commentaryKeys.length + ' entries.');
    } catch (err) {
      setStatus('View failed: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dev Commentary Sync</Text>
      <View style={styles.buttonRow}>
        <Button title="Export to File" onPress={exportCommentaries} />
        <Button title="Import from File" onPress={handleImportFromFile} />
        <Button title="View Local" onPress={viewCommentaries} />
        <Button title="Purge Local" color="#B22222" onPress={async () => {
          setStatus('Purging local commentaries...');
          try {
            const keys = await AsyncStorage.getAllKeys();
            const commentaryKeys = keys.filter(k => k.startsWith('commentary:'));
            await AsyncStorage.multiRemove(commentaryKeys);
            setStatus('All local commentaries purged.');
            setCommentaries(null);
          } catch (err) {
            setStatus('Purge failed: ' + err.message);
          }
        }} />
      </View>
      <Text style={styles.status}>{status}</Text>
      {commentaries && (
        <ScrollView style={styles.scroll}>
          {Object.entries(commentaries).map(([key, value]) => (
            <View key={key} style={styles.entry}>
              <Text style={styles.key}>{key}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(42,0,75,0.92)', // deep purple, semi-transparent
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  status: {
    fontSize: 13,
    color: '#ffe066', // soft gold
    marginBottom: 6,
    textAlign: 'center',
  },
  scroll: {
    maxHeight: 180,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 5,
    marginTop: 2,
  },
  entry: {
    borderBottomWidth: 1,
    borderBottomColor: 'gold',
    paddingVertical: 4,
  },
  key: {
    fontWeight: 'bold',
    color: 'gold',
    fontFamily: 'serif',
    fontSize: 14,
  },
  value: {
    fontSize: 13,
    color: '#ffe066',
    fontFamily: 'serif',
    marginTop: 2,
  },
  button: {
    backgroundColor: 'gold',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginHorizontal: 2,
    marginVertical: 2,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#3D0066',
    shadowOpacity: 0.19,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: '#2A004B',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
    fontFamily: 'serif',
  },
});
