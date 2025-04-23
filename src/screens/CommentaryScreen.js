// CommentaryScreen.js has been deprecated. This screen is intentionally left blank.
import { SafeAreaView, Text, StyleSheet, ScrollView, Button, ActivityIndicator, View } from 'react-native';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import apiConfig from '../config/api';

const CommentaryScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const fetchCommentary = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`${apiConfig.API_BASE_URL}/api/llm-contextual-passage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to fetch mystical commentary.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MysticalHomeBackground />
      <Text style={styles.title}>Mystical Interpretation</Text>
      <Text style={styles.subtitle}>Tap below to receive a Christ-centered, mystical passage and commentary for meditation.</Text>
      <Button title="Get Mystical Interpretation" onPress={fetchCommentary} disabled={loading} />
      <View style={styles.spacer} />
      {loading && <ActivityIndicator size="large" color="#6c63ff" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {result && (
        <ScrollView style={styles.resultContainer}>
          <Text style={styles.sectionLabel}>Random Verse</Text>
          <Text style={styles.verseRef}>
            {result.randomVerse.book} {result.randomVerse.chapter}:{result.randomVerse.verse}
          </Text>
          <Text style={styles.verseText}>{result.randomVerse.text.trim()}</Text>

          <Text style={styles.sectionLabel}>Passage ({result.book} {result.chapter}:{result.startVerse}-{result.endVerse})</Text>
          <Text style={styles.passage}>{result.passage.trim()}</Text>

          <Text style={styles.sectionLabel}>Mystical Interpretation</Text>
          <Text style={styles.commentary}>{result.commentary.trim()}</Text>

          <Text style={styles.sectionLabel}>Reasoning</Text>
          <Text style={styles.reasoning}>{result.reasoning.trim()}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#2d2d2d',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  spacer: {
    height: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 8,
  },
  resultContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    maxHeight: '60%',
  },
  sectionLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    color: '#6c63ff',
  },
  verseRef: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    color: '#333',
  },
  verseText: {
    fontStyle: 'italic',
    color: '#444',
    marginBottom: 8,
  },
  passage: {
    marginTop: 4,
    color: '#222',
    fontSize: 16,
    marginBottom: 8,
  },
  commentary: {
    marginTop: 4,
    color: '#2d2d2d',
    fontSize: 16,
    marginBottom: 8,
  },
  reasoning: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginBottom: 8,
  },
});

export default CommentaryScreen;
