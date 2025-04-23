import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';

/**
 * ScrollWornEdgesCommentary
 * SVG background for mystical commentary modal with more pronounced, mystical blemishes.
 * Props:
 * - width: number (default 355)
 * - height: number (default 540)
 * - style: object (optional)
 */
export default function ScrollWornEdgesCommentary({ width = 355, height = 540, style }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style}>
      <Defs>
        <LinearGradient id="parchment" x1="0" y1="0" x2="0" y2={height}>
          <Stop offset="0%" stopColor="#f5e4c3" />
          <Stop offset="100%" stopColor="#e3d3a1" />
        </LinearGradient>
        <LinearGradient id="edgeShadow" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#bfae66" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#8a6d3b" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* Main parchment background with more dramatic edge curves */}
      <Path
        d={`M36,0 Q18,${height * 0.10} 0,${height * 0.22} Q16,${height * 0.5} 0,${height * 0.78} Q18,${height * 0.92} 36,${height} H${width - 36} Q${width - 18},${height * 0.92} ${width},${height * 0.78} Q${width - 16},${height * 0.5} ${width},${height * 0.22} Q${width - 18},${height * 0.10} ${width - 36},0 Z`}
        fill="url(#parchment)"
      />
      {/* Left worn edge shadow */}
      <Path
        d={`M0,0 Q18,${height * 0.10} 0,${height * 0.22} Q16,${height * 0.5} 0,${height * 0.78} Q18,${height * 0.92} 36,${height}`}
        fill="none"
        stroke="url(#edgeShadow)"
        strokeWidth="19"
      />
      {/* Right worn edge shadow */}
      <Path
        d={`M${width},0 Q${width - 18},${height * 0.10} ${width},${height * 0.22} Q${width - 16},${height * 0.5} ${width},${height * 0.78} Q${width - 18},${height * 0.92} ${width - 36},${height}`}
        fill="none"
        stroke="url(#edgeShadow)"
        strokeWidth="19"
      />
      {/* Mystical blemishes and stains */}
      <Ellipse cx={width * 0.2} cy={height * 0.25} rx="18" ry="9" fill="#d6c398" opacity="0.18" />
      <Ellipse cx={width * 0.82} cy={height * 0.68} rx="14" ry="7" fill="#a18c5b" opacity="0.15" />
      <Ellipse cx={width * 0.5} cy={height * 0.82} rx="24" ry="11" fill="#9b7e3c" opacity="0.09" />
      <Ellipse cx={width * 0.33} cy={height * 0.6} rx="10" ry="5" fill="#7a6334" opacity="0.13" />
      <Ellipse cx={width * 0.7} cy={height * 0.18} rx="8" ry="4" fill="#bfae66" opacity="0.11" />
    </Svg>
  );
}
