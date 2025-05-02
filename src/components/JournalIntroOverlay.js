import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_KEY = 'mbc_journal_intro_dismissed_v1';

export default function JournalIntroOverlay({ visible, onDismiss, isAuthenticated, isPremium, onSignIn, onUpgrade }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!visible) return;
    AsyncStorage.getItem(INTRO_KEY).then(val => {
      setDontShowAgain(val === 'true');
    });
  }, [visible]);

  const handleToggle = async (value) => {
    setDontShowAgain(value);
    await AsyncStorage.setItem(INTRO_KEY, value ? 'true' : '');
  };

  const handleDismiss = async () => {
    if (dontShowAgain) {
      await AsyncStorage.setItem(INTRO_KEY, 'true');
    }
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="notebook-outline" size={44} color="#bfae66" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>Welcome to Your Mystical Journal</Text>
          <Text style={styles.body}>
            The Journal tab lets you record spiritual insights, mystical experiences, and personal reflections as you explore the Bible. 
          </Text>
          <Text style={[styles.body, { textAlign: 'left', alignSelf: 'stretch', marginBottom: 10 }]}> 
            <Text style={styles.gold}>Free users</Text> can save notes and revisit them anytime.
          </Text>
          <Text style={[styles.body, { textAlign: 'left', alignSelf: 'stretch' }]}> 
            <Text style={styles.gold}>Premium users</Text> unlock unlimited mystical commentary, bookmarks, and exclusive features to deepen your journey.
          </Text>
          {!isPremium && (
            <TouchableOpacity
              style={[styles.actionBtn, isAuthenticated ? styles.upgradeBtn : styles.signInBtn]}
              onPress={isAuthenticated ? onUpgrade : onSignIn}
              accessibilityRole="button"
            >
              <Text style={styles.actionBtnText}>
                {isAuthenticated ? 'Upgrade to Premium' : 'Sign In / Sign Up'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss} accessibilityRole="button">
            <Text style={styles.dismissText}>Start Journaling</Text>
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
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 320,
    maxWidth: '90%',
    borderWidth: 2,
    borderColor: '#bfae66',
    marginHorizontal: 12,
  },
  title: {
    fontSize: 22,
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
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 32,
    marginTop: 10,
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
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 38,
    marginTop: 4,
    alignItems: 'center',
    shadowColor: '#4a3d8f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  dismissText: {
    color: '#fffbe6',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'serif',
    letterSpacing: 0.4,
  },
});
