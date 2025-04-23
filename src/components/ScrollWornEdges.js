import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * ScrollWornEdges
 * SVG background for CustomPickerModal to imitate worn parchment scroll edges on left and right.
 * Props:
 * - width: number (default 340)
 * - height: number (default 540)
 * - style: object (optional)
 */
export default function ScrollWornEdges({ width = 340, height = 240, style }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style}>
      <Defs>
        <LinearGradient id="parchment" x1="0" y1="0" x2="0" y2={height}>
          <Stop offset="0%" stopColor="#f8f3e2" />
          <Stop offset="100%" stopColor="#e8e0c4" />
        </LinearGradient>
        <LinearGradient id="edgeShadow" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#c2b280" stopOpacity="0.35" />
          <Stop offset="100%" stopColor="#bfae66" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* Main parchment background */}
      <Path
        d={`M30,0 Q15,${height * 0.08} 0,${height * 0.18} Q10,${height * 0.5} 0,${height * 0.82} Q15,${height * 0.92} 30,${height} H${width - 30} Q${width - 15},${height * 0.92} ${width},${height * 0.82} Q${width - 10},${height * 0.5} ${width},${height * 0.18} Q${width - 15},${height * 0.08} ${width - 30},0 Z`}
        fill="url(#parchment)"
      />
      {/* Left worn edge shadow */}
      <Path
        d={`M0,0 Q15,${height * 0.08} 0,${height * 0.18} Q10,${height * 0.5} 0,${height * 0.82} Q15,${height * 0.92} 30,${height}`}
        fill="none"
        stroke="url(#edgeShadow)"
        strokeWidth="16"
      />
      {/* Right worn edge shadow */}
      <Path
        d={`M${width},0 Q${width - 15},${height * 0.08} ${width},${height * 0.18} Q${width - 10},${height * 0.5} ${width},${height * 0.82} Q${width - 15},${height * 0.92} ${width - 30},${height}`}
        fill="none"
        stroke="url(#edgeShadow)"
        strokeWidth="16"
      />
    </Svg>
  );
}
