import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * BottomFade
 * A fade overlay for the bottom of a ScrollView or content area.
 * Usage: <BottomFade height={60} color="#2A004B" />
 */
export default function BottomFade({ height = 60, color = '#2A004B', style }) {
  return (
    <View pointerEvents="none" style={[styles.container, { height }, style]}>
      <LinearGradient
        colors={[ 'transparent', color ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    left: 0,
    bottom: 0,
    zIndex: 2,
  },
});
