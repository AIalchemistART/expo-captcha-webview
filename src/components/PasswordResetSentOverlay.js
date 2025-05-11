import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PasswordResetSentOverlay({ visible, onClose }) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.body}>
          We’ve sent a password reset link to your email.
          {'\n'}
          <Text style={styles.emphasis}>Please open the link from your mobile device with the Mystical Bible Companion app installed.</Text>
        </Text>
        <TouchableOpacity style={styles.button} onPress={onClose} accessibilityRole="button">
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44,0,75,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    backgroundColor: '#3D0066',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    shadowColor: '#ffe066',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    color: '#ffe066',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: '#fffbe6',
    fontSize: 16,
    fontFamily: 'serif',
    marginBottom: 18,
    textAlign: 'center',
  },
  emphasis: {
    color: '#bfae66',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#bfae66',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  buttonText: {
    color: '#fffbe6',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'serif',
  },
});
