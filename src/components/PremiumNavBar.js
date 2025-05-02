import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import RoyalPurpleNavBarBackground from './RoyalPurpleNavBarBackground';

const { width } = Dimensions.get('window');

export default function PremiumNavBar({ children }) {
  return (
    <View style={styles.navbarContainer}>
      <RoyalPurpleNavBarBackground width={width} height={90} />
      <View style={styles.navContent}>
        <Text style={styles.navTitle}>{children}</Text>
      </View>
    </View>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  navbarContainer: {
    width: '100%',
    height: 90,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
    paddingHorizontal: 16,
  },
  navTitle: {
    fontFamily: 'Cardo-Bold',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    color: '#ffe066',
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
