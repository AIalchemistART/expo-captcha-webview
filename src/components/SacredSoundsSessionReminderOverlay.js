import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SacredSoundsSessionReminderOverlay({ visible, onClose, onUpgrade, onSignIn, isLoggedIn }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayBg}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons name="music-clef-treble" size={44} color="#7d5fff" style={{ marginBottom: 10 }} />
          <Text style={styles.title}>Preview Sacred Sounds</Text>
          <Text style={styles.body}>
            You’re listening to a preview of the Sacred Sounds collection. Please enjoy these free tracks which are open to all users. Upgrade to Premium for the full collection of mystical tracks & daily new releases as well as the ability to download and listen offline, and access to all future releases!
          </Text>
          {!isLoggedIn ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={onSignIn}>
              <Text style={styles.primaryBtnText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={onUpgrade}>
              <Text style={styles.primaryBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
            <Text style={styles.dismissText}>Continue Preview</Text>
          </TouchableOpacity>
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
    color: '#7d5fff',
    fontSize: 22,
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
});
