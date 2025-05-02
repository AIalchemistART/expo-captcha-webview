import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const INTRO_KEY = 'mbc_bible_intro_dismissed_v1';

export default function BibleIntroOverlay({
  visible,
  onClose,
  isLoggedIn,
  onSignIn,
  onUpgrade,
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!visible) return;
    AsyncStorage.getItem(INTRO_KEY).then(val => {
      setDontShowAgain(val === 'true');
    });
  }, [visible]);

  const handleToggle = async () => {
    const newVal = !dontShowAgain;
    setDontShowAgain(newVal);
    await AsyncStorage.setItem(INTRO_KEY, newVal ? 'true' : '');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="book-open-variant" size={44} color="#bfae66" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>Welcome to the Bible Tab</Text>
          <Text style={styles.body}>
            Explore the entire Bible, journal your spiritual journey, and receive mystical commentary on <Text style={styles.gold}>Genesis 1</Text> & <Text style={styles.gold}>Matthew 1</Text>—all for free.
          </Text>
          <Text style={[styles.body, { textAlign: 'left', alignSelf: 'stretch', marginBottom: 10 }]}> 
            <Text style={styles.gold}>Upgrade to Premium</Text> for unlimited mystical interpretations, bookmarking, and exclusive features to deepen your study.
          </Text>
          <View style={styles.ctaRow}>
            {!isLoggedIn ? (
              <TouchableOpacity style={[styles.actionBtn, styles.signInBtn]} onPress={onSignIn} accessibilityRole="button">
                <Text style={styles.actionBtnText}>Sign In / Sign Up</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.actionBtn, styles.upgradeBtn]} onPress={onUpgrade} accessibilityRole="button">
                <Text style={styles.actionBtnText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.dismissBtn} onPress={onClose} accessibilityRole="button">
            <Text style={styles.dismissText}>Start Exploring</Text>
          </TouchableOpacity>
          <View style={styles.toggleRow}>
            <Switch
              value={dontShowAgain}
              onValueChange={handleToggle}
              thumbColor={dontShowAgain ? '#bfae66' : '#eee6c1'}
              trackColor={{ false: '#d7c6ff', true: '#a48dff' }}
            />
            <Text style={styles.toggleLabel}>Don't show again</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(44,0,77,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fffbe6',
    borderRadius: 28,
    paddingVertical: 38,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 14,
    minWidth: 320,
    maxWidth: '92%',
    borderWidth: 2,
    borderColor: '#bfae66',
    marginHorizontal: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#3D0066',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'serif',
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 16,
    color: '#4a3d8f',
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: 'serif',
    lineHeight: 23,
  },
  gold: {
    color: '#bfae66',
    fontWeight: 'bold',
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 32,
    marginTop: 4,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    width: '100%',
  },
  signInBtn: {
    backgroundColor: '#7c3aed',
  },
  upgradeBtn: {
    backgroundColor: '#ffe066',
  },
  actionBtnText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
    textTransform: 'uppercase',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 15,
    color: '#4a3d8f',
    marginLeft: 10,
    fontFamily: 'serif',
  },
  dismissBtn: {
    backgroundColor: '#a48dff',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 38,
    marginTop: 8,
    elevation: 2,
    alignItems: 'center',
    shadowColor: '#4a3d8f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  dismissText: {
    color: '#fffbe6',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
    letterSpacing: 0.4,
  },
});
