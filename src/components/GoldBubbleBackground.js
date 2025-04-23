import React from 'react';
import { Svg, Defs, LinearGradient, Stop, RadialGradient, Ellipse, Circle, Path, G } from 'react-native-svg';

/**
 * GoldBubbleBackground
 * A gold/metallic flake 3D bubble SVG for mystical buttons or overlays.
 * - width, height, borderRadius are customizable
 * - Designed for overlaying text/icons inside
 */
export default function GoldBubbleBackground({ width = 120, height = 50, borderRadius = 26 }) {
  return (
    <Svg width={width} height={height} style={{ backgroundColor: 'transparent' }}>
      <Defs>
        {/* Main gold gradient */}
        <LinearGradient id="goldBubbleGradient" x1="0" y1="0" x2={width} y2={height} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#fffbe6" />
          <Stop offset="40%" stopColor="#ffe066" />
          <Stop offset="80%" stopColor="#c7a43d" />
          <Stop offset="100%" stopColor="#bfae66" />
        </LinearGradient>
        {/* Flake sparkle */}
        <RadialGradient id="bubbleSparkle" cx="50%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#fffbe6" stopOpacity="0.7" />
          <Stop offset="60%" stopColor="#ffe066" stopOpacity="0.2" />
          <Stop offset="100%" stopColor="#ffe066" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {/* Main bubble shape */}
      <Ellipse
        cx={width/2}
        cy={height/2}
        rx={width/2}
        ry={height/2}
        fill="url(#goldBubbleGradient)"
      />
      {/* 3D highlight/shine */}
      <Ellipse
        cx={width * 0.38}
        cy={height * 0.37}
        rx={width * 0.23}
        ry={height * 0.17}
        fill="url(#bubbleSparkle)"
        opacity={0.85}
      />
      {/* Metallic flakes and bubbles (randomized for effect) */}
      <G opacity={0.33}>
        <Circle cx={width*0.18} cy={height*0.7} r={2.2} fill="#fffbe6" />
        <Circle cx={width*0.72} cy={height*0.23} r={1.5} fill="#ffe066" />
        <Circle cx={width*0.88} cy={height*0.63} r={1.9} fill="#fffbe6" />
        <Circle cx={width*0.62} cy={height*0.74} r={1.1} fill="#fff" />
        <Circle cx={width*0.33} cy={height*0.55} r={1.5} fill="#ffe066" />
      </G>
      {/* Subtle shadow for 3D effect */}
      <Ellipse
        cx={width/2}
        cy={height*0.98}
        rx={width*0.42}
        ry={height*0.13}
        fill="#bfae66"
        opacity={0.25}
      />
    </Svg>
  );
}
