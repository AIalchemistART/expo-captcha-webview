import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';

// An opulent, gold filigree back arrow icon
export default function OpulentBackArrow({ size = 32, color = 'gold' }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Filigree circle */}
        <Circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2" fill="none" />
        {/* Main arrow */}
        <Path
          d="M20 8 L12 16 L20 24"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Decorative filigree swirls */}
        <G stroke={color} strokeWidth="1.2" fill="none">
          <Path d="M12 16 Q9 14, 10 11 Q12 8, 16 10" />
          <Path d="M12 16 Q9 18, 10 21 Q12 24, 16 22" />
        </G>
      </Svg>
    </View>
  );
}
