import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * MysticalAuthGate Modal
 * For unauthenticated users attempting to access premium mystical commentary.
 * - Explains benefits of signing in (sync, privacy, mystical access)
 * - Explains premium upgrade (unlimited mystical commentary, exclusive features)
 * - Styled to match mystical theme and other AuthGate modals
 */
import PropTypes from 'prop-types';
import { useAuth } from '../auth/useAuth';

export default function MysticalAuthGate({ visible, onLoginPress, onUpgradePress, onDismiss, user, isPremium }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="star-four-points-outline" size={38} color="#bfae66" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>Sign In for Mystical Commentary</Text>
          <View style={{ width: '100%', marginBottom: 10 }}>
            <Text style={styles.body}>
              Mystical interpretations are a premium feature. Sign up or log in to:
            </Text>
            <Text style={styles.bullet}>• Unlock unlimited mystical commentary</Text>
            <Text style={styles.bullet}>• Sync insights across devices</Text>
            <Text style={styles.bullet}>• Keep your spiritual journey private and secure</Text>
            <Text style={styles.bullet}>• Full access to new features</Text>
            <Text style={styles.bullet}>• Full collection of myusical meditations</Text>
            <Text style={[styles.bullet, { marginBottom: 22 }]}>• Priority support & feedback</Text>
            <Text style={styles.body}>
              Upgrade to Premium for unlimited mystical interpretations, exclusive spiritual tools, and a richer mystical experience!
            </Text>
          </View>
          {/* Show Sign Up / Log In only for unauthenticated users */}
          {(!user) && (
            <TouchableOpacity style={styles.button} onPress={onLoginPress}>
              <Text style={styles.buttonText}>Sign Up / Log In</Text>
            </TouchableOpacity>
          )}
          {/* Show Upgrade only for authenticated, non-premium users */}
          {(user && !isPremium) && (
            <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgradePress}>
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dismiss} onPress={onDismiss}>
            <Text style={styles.dismissText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

MysticalAuthGate.propTypes = {
  visible: PropTypes.bool.isRequired,
  onLoginPress: PropTypes.func.isRequired,
  onUpgradePress: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  user: PropTypes.object, // null if unauthenticated
  isPremium: PropTypes.bool // true if user is premium
};

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
