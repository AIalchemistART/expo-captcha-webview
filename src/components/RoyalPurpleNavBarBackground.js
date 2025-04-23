import React from 'react';
import { Svg, Defs, LinearGradient, Stop, Ellipse, G, Circle } from 'react-native-svg';

/**
 * RoyalPurpleNavBarBackground
 * A 3D, mystical royal purple SVG background for navigation bars.
 * Usage: <RoyalPurpleNavBarBackground width={width} height={height} />
 */
export default function RoyalPurpleNavBarBackground({ width = 420, height = 90 }) {
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Defs>
        <LinearGradient id="navBarGradient" x1="0" y1="0" x2={width} y2={height} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#7c3aed" />
          <Stop offset="50%" stopColor="#3D0066" />
          <Stop offset="100%" stopColor="#2A004B" />
        </LinearGradient>
      </Defs>
      {/* Main 3D ellipse shape for the nav bar background */}
      <Ellipse
        cx={width/2}
        cy={height*0.82}
        rx={width/2}
        ry={height*0.95}
        fill="url(#navBarGradient)"
      />
      {/* Soft highlight for 3D effect */}
      <Ellipse
        cx={width*0.5}
        cy={height*0.48}
        rx={width*0.36}
        ry={height*0.22}
        fill="#fff"
        opacity={0.10}
      />
      {/* Magical sparkles */}
      <G opacity={0.13}>
        <Circle cx={width*0.15} cy={height*0.7} r={3.2} fill="#ffe066" />
        <Circle cx={width*0.82} cy={height*0.36} r={2.5} fill="#fffbe6" />
        <Circle cx={width*0.66} cy={height*0.64} r={1.9} fill="#ffe066" />
        <Circle cx={width*0.45} cy={height*0.29} r={2.1} fill="#fff" />
      </G>
    </Svg>
  );
}
