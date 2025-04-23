import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, StyleSheet, View } from 'react-native';
import MysticalHomeBackground from '../components/MysticalHomeBackground';

const JournalScreen = () => (
  <SafeAreaView style={styles.container}>
    <MysticalHomeBackground />
    <StatusBar style="light" backgroundColor="transparent" translucent={true} />
    <View style={{ marginTop: -80, alignItems: 'center', width: '100%' }}>
      {/* <Text style={styles.title}>Journal</Text> */}
      <Text style={styles.subtitle}>Reflect and record your spiritual journey here.</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A004B', // Dark mystical purple
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'gold',
    fontFamily: 'serif',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffe066', // Soft gold
    fontFamily: 'serif',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default JournalScreen;
