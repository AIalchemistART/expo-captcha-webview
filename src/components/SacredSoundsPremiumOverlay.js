import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEY = 'mbc_sacred_sounds_overlay_dismissed_v1';

export default function SacredSoundsPremiumOverlay({ visible, onClose, onSignIn, onUpgrade, isLoggedIn }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!visible) return;
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      setDontShowAgain(val === 'true');
    });
  }, [visible]);

  const handleToggle = async (value) => {
    setDontShowAgain(value);
    await AsyncStorage.setItem(STORAGE_KEY, value ? 'true' : '');
  };

  const handleClose = async () => {
    if (dontShowAgain) {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    }
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlayBg}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons name="music-clef-treble" size={48} color="#7d5fff" style={{ marginBottom: 10 }} />
          <Text style={styles.title}>Sacred Sounds Premium</Text>
          <Text style={styles.body}>
            Experience the full Sacred Sounds library! These tracks are open to all users so you can sample the magic. Unlock the full collection and future additions by upgrading to Premium.
          </Text>
          <View style={styles.benefitsBox}>
            <Text style={styles.benefit}>• Unlimited access to all Sacred Sounds</Text>
            <Text style={styles.benefit}>• New mystical tracks added regularly</Text>
            <Text style={styles.benefit}>• Download and listen offline</Text>
            <Text style={styles.benefit}>• Support the vision of Mystical Bible Companion</Text>
          </View>
          {!isLoggedIn ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={onSignIn}>
              <Text style={styles.primaryBtnText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => {
  onUpgrade && onUpgrade();
}}>
              <Text style={styles.primaryBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dismissBtn} onPress={handleClose}>
            <Text style={styles.dismissText}>Maybe Later</Text>
          </TouchableOpacity>
          <View style={styles.toggleRow}>
            <Switch
              value={dontShowAgain}
              onValueChange={handleToggle}
              thumbColor={dontShowAgain ? '#bfae66' : '#eee6c1'}
              trackColor={{ false: '#d7c6ff', true: '#a48dff' }}
            />
            <Text style={styles.toggleLabel}>Don't show this again</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(30, 0, 50, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#f5e4c3',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: '#7d5fff', // Match other overlays
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'serif',
    textAlign: 'center',
    textShadowColor: '#fffbe6',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8
  },
  body: {
    color: '#2A004B',
    fontSize: 16,
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  benefitsBox: {
    marginBottom: 18,
    alignSelf: 'stretch',
  },
  benefit: {
    color: '#7d5fff',
    fontSize: 15,
    marginBottom: 4,
    fontFamily: 'serif',
  },
  primaryBtn: {
    backgroundColor: '#7d5fff',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 28,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
  },
  dismissBtn: {
    backgroundColor: '#eee7d7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#bfae66',
    minWidth: 180,
    alignItems: 'center',
    marginBottom: 10,
  },
  dismissText: {
    color: '#7d5fff',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  toggleLabel: {
    color: '#2A004B',
    fontSize: 14,
    marginLeft: 10,
    fontFamily: 'serif',
  },
});
