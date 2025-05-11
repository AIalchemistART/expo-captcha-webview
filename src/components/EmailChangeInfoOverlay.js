import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EmailChangeInfoOverlay({ visible, onDismiss }) {
  console.log('[EmailChangeInfoOverlay] Rendered', { visible, onDismiss });
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="email-check-outline" size={42} color="#bfae66" style={{ marginBottom: 10 }} />
          <Text style={styles.title}>Confirm Your Email Change</Text>
          <Text style={styles.instructions}>
            For your security, Mystical Bible Companion uses a two-step email change process:
            {"\n\n"}
            1. You will receive a confirmation link at BOTH your old and new email addresses.
            {"\n"}
            2. You must open and confirm BOTH emails for the change to take effect.
            {"\n\n"}
            This is different from most apps, but it helps protect your account. If you don't see the emails, check your spam or promotions folder.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onDismiss} accessibilityRole="button">
            <Text style={styles.buttonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(44,0,75,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#bfae66',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 24,
    maxWidth: 340,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6a4c93',
    marginBottom: 14,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#3d2c57',
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#bfae66',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 34,
    marginTop: 6,
  },
  buttonText: {
    color: '#fffbe6',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
