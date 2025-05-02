import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function JournalLoadingSpinner({ message }) {
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.spinnerBox}>
        <ActivityIndicator size="large" color="#FFD700" />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 0, 80, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  spinnerBox: {
    backgroundColor: 'rgba(32, 0, 48, 0.85)',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  message: {
    marginTop: 16,
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'serif',
  },
});
