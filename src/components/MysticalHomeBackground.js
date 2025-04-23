import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, G, Rect, Ellipse, Circle, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const heightPlus = height + 80; // Stretch SVG to cover status/nav bars

/**
 * MysticalHomeBackground
 * A full-screen SVG background blending celestial (stars, orbs) and geometric (mandala/rose window) elements.
 * - Deep purple-to-black radial gradient base
 * - Subtle gold and white stars/orbs
 * - Central gold mandala geometry (50% larger, 20% more faint)
 * - Soft vignette at edges
 */
const MysticalHomeBackground = () => (
  <Svg width={width} height={heightPlus} viewBox={`0 0 ${width} ${heightPlus}`} style={{ position: 'absolute', top: -10, left: 0 }}>
    <Defs>
      {/* Radial background gradient */}
      <RadialGradient id="bgGradient" cx="50%" cy="45%" rx="60%" ry="80%">
        <Stop offset="0%" stopColor="#3d0066" />
        <Stop offset="80%" stopColor="#2A004B" />
        <Stop offset="100%" stopColor="#000" />
      </RadialGradient>
      {/* Gold radial for mandala */}
      <RadialGradient id="goldRadial" cx="50%" cy="50%" rx="50%" ry="50%">
        <Stop offset="0%" stopColor="#ffe066" stopOpacity="0.7" />
        <Stop offset="80%" stopColor="#ffe066" stopOpacity="0.1" />
        <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </RadialGradient>
      {/* Vignette gradient */}
      <RadialGradient id="vignette" cx="50%" cy="50%" rx="60%" ry="60%">
        <Stop offset="70%" stopColor="#000" stopOpacity="0" />
        <Stop offset="100%" stopColor="#000" stopOpacity="0.45" />
      </RadialGradient>
    </Defs>
    <G transform="translate(0, 5)">
      {/* Background - leave bottom 60px transparent for nav bar */}
      <Rect x="0" y="0" width={width} height={heightPlus - 10} fill="url(#bgGradient)" />
      {/* Celestial orbs/stars */}
      <G opacity="0.21">
        {[...Array(18)].map((_, i) => (
          <Circle
            key={i}
            cx={Math.random() * width}
            cy={Math.random() * height}
            r={Math.random() * 9 + 2}
            fill={i % 4 === 0 ? '#ffe066' : '#fff'}
            opacity={Math.random() * 0.7 + 0.3}
          />
        ))}
      </G>
      {/* Central mandala/rose window (geometric) */}
      <G>
        <Ellipse cx={width / 2} cy={height * 0.44} rx={width * 0.435} ry={width * 0.435} fill="url(#goldRadial)" opacity={0.56} />
        {/* Simple geometric mandala lines */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const x1 = width / 2 + Math.cos(angle) * width * 0.135;
          const y1 = height * 0.44 + Math.sin(angle) * width * 0.135;
          const x2 = width / 2 + Math.cos(angle) * width * 0.435;
          const y2 = height * 0.44 + Math.sin(angle) * width * 0.435;
          return (
            <Path
              key={i}
              d={`M${x1},${y1} L${x2},${y2}`}
              stroke="#ffe066"
              strokeWidth={2.2}
              opacity={0.28} // 20% more faint
            />
          );
        })}
        {/* Mandala concentric circles */}
        {[0.13, 0.18, 0.23, 0.29].map((r, i) => (
          <Ellipse
            key={i}
            cx={width / 2}
            cy={height * 0.44}
            rx={width * r * 1.5}
            ry={width * r * 1.5}
            stroke="#ffe066"
            strokeWidth={i === 3 ? 2.2 : 1.1}
            opacity={i === 3 ? 0.336 : 0.144} // 20% more faint
            fill="none"
          />
        ))}
      </G>
      {/* Soft vignette overlay */}
      <Rect x="0" y="0" width={width} height={heightPlus - 10} fill="url(#vignette)" />
    </G>
  </Svg>
);

export default MysticalHomeBackground;
