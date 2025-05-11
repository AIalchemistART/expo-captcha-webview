import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

export default function NotesAuthGate({ visible, onLoginPress, onDismiss }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Create an Account to Save Notes</Text>
          <Text style={styles.body}>
            Note-taking is a free feature, but you need to sign up or log in to privately and securely save your notes.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onLoginPress}>
            <Text style={styles.buttonText}>Sign Up / Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismiss} onPress={onDismiss}>
            <Text style={styles.dismissText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(44,0,77,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 7,
    minWidth: 300,
    maxWidth: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D0066',
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  body: {
    fontSize: 16,
    color: '#2A004B',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  button: {
    backgroundColor: '#ffe066',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginBottom: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
  },
  dismiss: {
    marginTop: 4,
  },
  dismissText: {
    color: '#bfae66',
    fontSize: 15,
    fontFamily: 'serif',
    textDecorationLine: 'underline',
  },
});
