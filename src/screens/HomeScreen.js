import React from 'react';
import { Text, StyleSheet, Button, View, Dimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import DevCommentarySync from '../components/DevCommentarySync';
import { useAuth } from '../auth/useAuth';

import { useProfile } from '../auth/useProfile';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const isPremium = !!profile?.is_paid;
  const isLoggedIn = !!user;
  // Free: not premium (either not logged in, or logged in but not paid)
  const isFree = !isPremium;

  // --- Dynamic collision logic for Journal button ---
  const { height: windowHeight } = require('react-native').useWindowDimensions();
  const insets = require('react-native-safe-area-context').useSafeAreaInsets?.() ?? { top: 0, bottom: 0 };
  // Robust bottom inset: fallback to 48px if insets.bottom is 0 (for Android nav bar)
  const bottomInset = (insets.bottom && insets.bottom > 0) ? insets.bottom : 48;
  const extraBuffer = 24; // Explicit buffer above nav bar
  console.log('[HomeScreen] windowHeight:', windowHeight);
  console.log('[HomeScreen] insets:', insets, 'bottomInset (with fallback):', bottomInset, 'extraBuffer:', extraBuffer);
  // --- End dynamic collision logic ---

  // Move bottomInset+extraBuffer padding to SafeAreaView (top-level)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#2A004B', flex: 1, paddingBottom: bottomInset + extraBuffer }]} edges={['top', 'bottom']}>
      <MysticalHomeBackground />
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      {/* DEV ONLY: Commentary Sync Utility */}
      {process.env.EXPO_PUBLIC_DEV_MODE === 'true' && <DevCommentarySync />}

      <TouchableOpacity
        style={
          isLoggedIn && isPremium
            ? styles.premiumTab
            : [
                styles.parchmentPremiumButton,
                styles.parchmentPremiumButtonSelected,
              ]
        }
        onPress={() => navigation.navigate('Premium')}
        accessibilityLabel="Go to Premium features, login, and payment"
      >
        <Text style={isLoggedIn && isPremium ? styles.premiumTabText : styles.parchmentPremiumText}>
          Premium
        </Text>
      </TouchableOpacity>
      <Text style={styles.title}>Mystical Bible Companion</Text>
      <Text style={styles.subtitle}>Welcome! Your journey into deeper wisdom begins here.</Text>
      <View style={styles.buttonContainer}
        onLayout={e => {
          const { x, y, width, height } = e.nativeEvent.layout;
          console.log('[HomeScreen] buttonContainer layout:', { x, y, width, height });
        }}
      >
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
          style={[
            styles.mysticalButton,
            styles.journalButton
          ]}
          onPress={() => navigation.navigate('Journal')}
          accessibilityLabel="Go to Journal"
          onLayout={e => {
            const { x, y, width, height } = e.nativeEvent.layout;
            // console.log('[HomeScreen] GTJ button layout:', { x, y, width, height });
          }}
        >
          <Text style={styles.mysticalButtonText}>Go to Journal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- Premium Button (for logged-out, parchment style) ---
  parchmentPremiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 28,
    backgroundColor: 'rgba(250,240,210,0.92)',
    shadowColor: '#ffe066', // gold shadow
    shadowOpacity: 0.18,
    shadowRadius: 7.2,
    elevation: 4.8,
    marginVertical: 8.4,
    marginTop: 75,
    marginBottom: -50,
    alignSelf: 'center',
    borderWidth: 2.5,
    borderColor: '#ffe066', // gold border
    minWidth: 80,
    maxWidth: 260,
    alignSelf: 'center',
  },
  parchmentPremiumButtonSelected: {
    backgroundColor: 'rgba(255,251,230,0.98)',
    shadowOpacity: 0.28,
    elevation: 8,
  },
  parchmentPremiumText: {
    color: '#7a6334', // dark gold text
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.72,
    textShadowColor: '#ffe066',
    textShadowOffset: { width: 0, height: 1.44 },
    textShadowRadius: 5.76,
    fontFamily: 'serif',
    zIndex: 2,
    textAlign: 'center',
    width: '50%',
  },
  premiumTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 34,
    backgroundColor: '#ffe066',
    shadowColor: '#3D0066',
    shadowOpacity: 0.18,
    shadowRadius: 7.2,
    elevation: 4.8,
    marginVertical: 10,
    marginTop: 75,
    marginBottom: -50,
    alignSelf: 'center',
    minWidth: 96,
    maxWidth: 312,
    // borderWidth and borderColor not used for premiumTab
    shadowOffset: { width: 0, height: 2 },
  },
  premiumTabText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 20,
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
    flex: 1, // take up all available space
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end', // push buttons to the bottom
    // marginTop removed for robust flex layout
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
    marginBottom: 16, // ensure extra space above nav bar
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
