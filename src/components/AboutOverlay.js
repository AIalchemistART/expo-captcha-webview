import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEY = 'mbc_hide_about_overlay';

export default function AboutOverlay({ visible, onDismiss, showDontShowToggle = true }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset on open
      setDontShowAgain(false);
    }
  }, [visible]);

  const handleToggle = async (value) => {
    setDontShowAgain(value);
    if (showDontShowToggle) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, value ? 'true' : '');
      } catch (e) {
        // Ignore errors
      }
    }
  };

  const handleClose = async () => {
    if (showDontShowToggle && dontShowAgain) {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    }
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="yin-yang" size={46} color="#bfae66" style={{ marginBottom: 10 }} />
          <Text style={styles.title}>Welcome to Mystical Bible Companion</Text>
          <Text style={styles.vision}>
            Our vision is to illuminate this sacred text with mystical, heterodox, and alchemical perspectives—empowering your spiritual journey with beauty, wisdom, and wonder.
          </Text>
          <Text style={styles.philosophy}>
            ✨ We believe in open, inclusive, and transformative exploration of scripture. This app blends ancient symbolism, AI-generated insight, and a visually enchanting design to inspire reflection and growth.
          </Text>
          <Text style={styles.contact}>
            For feedback, questions, or to share your mystical journey, contact us at:
            <Text style={styles.email} onPress={() => Linking.openURL('mailto:manny@aialchemist.net')}> manny@aialchemist.net</Text>
          </Text>
          {showDontShowToggle && (
            <View style={styles.toggleRow}>
              <Switch
                value={dontShowAgain}
                onValueChange={handleToggle}
                thumbColor={dontShowAgain ? '#bfae66' : '#eee6c1'}
                trackColor={{ false: '#d7c6ff', true: '#a48dff' }}
              />
              <Text style={styles.toggleLabel}>Don't show this again</Text>
            </View>
          )}
          <TouchableOpacity style={styles.dismissBtn} onPress={handleClose}>
            <Text style={styles.dismissText}>Enter the App</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Helper to check if overlay should show on app init
export async function shouldShowAboutOverlay() {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    return val !== 'true';
  } catch {
    return true;
  }
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
  vision: {
    fontSize: 17,
    color: '#4a3d8f',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'serif',
    lineHeight: 25,
  },
  philosophy: {
    fontSize: 16,
    color: '#6B1A7A',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 23,
  },
  contact: {
    fontSize: 14,
    color: '#2A004B',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  email: {
    color: '#a48dff',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
