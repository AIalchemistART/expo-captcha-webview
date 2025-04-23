import React from 'react';
import { Text, StyleSheet, Button, View, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import DevCommentarySync from '../components/DevCommentarySync';

const HomeScreen = ({ navigation }) => (
  <SafeAreaView style={[styles.container, { backgroundColor: '#2A004B', flex: 1 }]} edges={['top', 'bottom']}>
    <MysticalHomeBackground />
    <StatusBar style="light" backgroundColor="transparent" translucent={true} />
    {/* DEV ONLY: Commentary Sync Utility */}
    <DevCommentarySync />
    <TouchableOpacity
      style={styles.premiumTab}
      onPress={() => navigation.navigate('Premium')}
      accessibilityLabel="Go to Premium features, login, and payment"
    >
      <Text style={styles.premiumTabText}>🌟 Premium</Text>
    </TouchableOpacity>
    <Text style={styles.title}>Mystical Bible Companion</Text>
    <Text style={styles.subtitle}>Welcome! Your journey into deeper wisdom begins here.</Text>
    <View style={styles.buttonContainer}>
      <TouchableOpacity
  style={styles.mysticalButton}
  onPress={() => navigation.navigate('DivineInspiration')}
  accessibilityLabel="Receive Divine Inspiration"
>
  <Text style={styles.mysticalButtonText}>Receive Divine Inspiration</Text>
</TouchableOpacity>
      <View style={styles.spacer} />
      <TouchableOpacity
  style={styles.mysticalButton}
  onPress={() => navigation.navigate('Bible')}
  accessibilityLabel="Go to Bible"
>
  <Text style={styles.mysticalButtonText}>Go to Bible</Text>
</TouchableOpacity>
      <View style={styles.spacer} />
      <TouchableOpacity
  style={[styles.mysticalButton, styles.journalButton]}
  onPress={() => navigation.navigate('Journal')}
  accessibilityLabel="Go to Journal"
>
  <Text style={styles.mysticalButtonText}>Go to Journal</Text>
</TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  premiumTab: {
    alignSelf: 'center',
    backgroundColor: '#ffe066',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 28,
    marginTop: 16,
    marginBottom: 4,
    shadowColor: '#3D0066',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  premiumTabText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    // backgroundColor handled by SafeAreaView directly
    // Remove marginTop or paddingTop if any
  },
  buttonContainer: {
    marginTop: 200, // move down about 1.5 inches
    width: '100%',
    alignItems: 'center',
  },
  mysticalButton: {
    backgroundColor: 'gold',
    borderRadius: 22, // 20% smaller
    paddingVertical: 14, // 20% smaller
    paddingHorizontal: 35, // 20% smaller
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8, // slightly smaller vertical spacing
    shadowColor: '#3D0066',
    shadowOpacity: 0.22,
    shadowRadius: 10, // slightly smaller
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    minWidth: '64%', // 20% smaller
    alignSelf: 'center',
  },
  journalButton: {
    minWidth: '52%', // about 10% less than mysticalButton
  },
  mysticalButtonText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 15, // 20% smaller
    letterSpacing: 0.5,
    textShadowColor: '#fffbe6',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 7, // slightly smaller
    textAlign: 'center',
    paddingHorizontal: 2,
    fontFamily: 'serif',
  },
  spacer: {
    height: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'gold',
    fontFamily: 'serif',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: 220,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffe066', // Soft gold
    fontFamily: 'serif',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 0,
  },
});

export default HomeScreen;
