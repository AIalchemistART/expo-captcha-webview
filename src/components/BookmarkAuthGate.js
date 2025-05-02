import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * BookmarkAuthGate Modal
 * For unauthenticated users attempting to use bookmarks.
 * - Explains benefits of signing in (sync, privacy, backup)
 * - Explains premium upgrade (unlimited bookmarks, mystical features)
 * - Styled to match mystical theme and NotesAuthGate
 */
export default function BookmarkAuthGate({ visible, onLoginPress, onUpgradePress, onDismiss }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="bookmark-outline" size={36} color="#bfae66" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>Sign In to Save Bookmarks</Text>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }} style={{ maxHeight: 220, width: '100%' }}>
            <Text style={styles.body}>
              Bookmarks let you save your favorite passages, mystical insights, and notes across all your devices. Sign up or log in to:
            </Text>
            <Text style={styles.bullet}>• Keep your bookmarks private and secure</Text>
            <Text style={styles.bullet}>• Access bookmarks from any device</Text>
            <Text style={styles.bullet}>• Restore your highlights if you reinstall</Text>
            <Text style={styles.body}>
              Upgrade to Premium for unlimited bookmarks and exclusive mystical features!
            </Text>
            <Text style={styles.bullet}>• Unlimited bookmarks</Text>
            <Text style={styles.bullet}>• Mystical commentary for every passage</Text>
            <Text style={styles.bullet}>• Premium-only mystical UI effects</Text>
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={onLoginPress}>
            <Text style={styles.buttonText}>Sign Up / Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgradePress}>
            <Text style={styles.upgradeText}>Upgrade to Premium</Text>
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
    backgroundColor: 'rgba(44,0,77,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fffbe6',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 300,
    maxWidth: '85%',
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#3D0066',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  body: {
    fontSize: 16,
    color: '#2A004B',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  bullet: {
    fontSize: 15,
    color: '#6B1A7A',
    marginBottom: 4,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontFamily: 'serif',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#ffe066',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 12,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'serif',
  },
  upgradeBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 22,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  upgradeText: {
    color: '#fffbe6',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'serif',
  },
  dismiss: {
    marginTop: 8,
  },
  dismissText: {
    color: '#bfae66',
    fontSize: 15,
    fontFamily: 'serif',
    textDecorationLine: 'underline',
  },
});
