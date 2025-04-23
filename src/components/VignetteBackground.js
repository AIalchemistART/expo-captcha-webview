import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// A reusable vignette background for context windows using a radial gradient
export default function VignetteBackground({ borderRadius = 22, style }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[ 
        'rgba(60,40,15,0)',       // center
        'rgba(60,40,15,0.35)',   // mid
        'rgba(40,20,5,0.65)',    // near edge
        'rgba(20,10,2,0.92)'     // edge/corners
      ]}
      locations={[0.45, 0.7, 0.9, 1]}
      style={[
        styles.vignette,
        { borderRadius },
        style,
      ]}
      start={{ x: 0.5, y: 0.5 }}
      end={{ x: 0.5, y: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  vignette: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
});
