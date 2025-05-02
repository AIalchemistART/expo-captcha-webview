import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MysticalButtonBackground from './MysticalButtonBackground';

/**
 * GetInspiredRadioButton
 * A mystical, gold-accented radio/nav button for the Divine Inspiration tab.
 * Props:
 * - selected: boolean
 * - onPress: function
 * - label: string (default 'Get Inspired!')
 * - loading: boolean (optional)
 */
export default function GetInspiredRadioButton({ selected, onPress, label = 'Get Inspired!', loading }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      disabled={loading}
    >
      <MysticalButtonBackground width={78} height={78} borderRadius={38} style={styles.bubbleBg} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 23,
    borderRadius: 28,
    backgroundColor: 'rgba(255,251,230,0.98)', // parchment
    borderColor: '#ffe066', // gold
    borderWidth: 2.5,
    shadowColor: '#A889FF',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
    marginVertical: 8.4,
  },

  label: {
    color: '#bfae66', // dark gold
    fontWeight: 'bold',
    fontSize: 20,
    textShadowColor: '#ffe066', // gold shadow
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    fontFamily: 'serif',
    marginLeft: 16,
  },
  bubbleBg: {
    position: 'absolute',
    left: -10, // reduced from -16
    top: '50%',
    marginTop: -16, // reduced from -27
    zIndex: 0,
  },
  radioCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#bfae66',
    backgroundColor: '#fffbe6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    zIndex: 2,
  },
  radioCircleSelected: {
    borderColor: '#7a6334',
    backgroundColor: '#ffe066',
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7a6334',
  },
  label: {
    fontSize: 17.3, // increased by 20% from 14.4
    fontWeight: 'bold',
    color: '#7a6334',
    letterSpacing: 0.72, // increased by 20% from 0.6
    textShadowColor: '#ffe066',
    textShadowOffset: { width: 0, height: 1.44 }, // increased by 20% from 1.2
    textShadowRadius: 5.76, // increased by 20% from 4.8
    fontFamily: 'serif',
    zIndex: 2,
  },
  labelSelected: {
    color: '#7a6334',
    textShadowColor: '#ffe066',
  },
});
