import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { tokens } from '../theme';

type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

function defaults(p: Props) {
  return {
    width: p.size ?? 22,
    height: p.size ?? 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: p.color ?? tokens.color.text,
    strokeWidth: p.strokeWidth ?? 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export const Icon = {
  Home: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  ),
  QrCode: (p: Props) => (
    <Svg {...defaults(p)}>
      <Rect width="5" height="5" x="3" y="3" rx="1" />
      <Rect width="5" height="5" x="16" y="3" rx="1" />
      <Rect width="5" height="5" x="3" y="16" rx="1" />
      <Path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1" />
    </Svg>
  ),
  User: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  ),
  Users: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  ),
  Rocket: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <Path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <Path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </Svg>
  ),
  MessageCircle: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </Svg>
  ),
  Trophy: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Svg>
  ),
  Pin: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  Calendar: (p: Props) => (
    <Svg {...defaults(p)}>
      <Rect width="18" height="18" x="3" y="4" rx="2" />
      <Line x1="16" x2="16" y1="2" y2="6" />
      <Line x1="8" x2="8" y1="2" y2="6" />
      <Line x1="3" x2="21" y1="10" y2="10" />
    </Svg>
  ),
  ChevronDown: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="m6 9 6 6 6-6" />
    </Svg>
  ),
  Check: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="M20 6 9 17l-5-5" />
    </Svg>
  ),
  Hourglass: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.42A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.42A2 2 0 0 0 17 6.17V2" />
    </Svg>
  ),
  Mail: (p: Props) => (
    <Svg {...defaults(p)}>
      <Rect width="20" height="16" x="2" y="4" rx="2" />
      <Path d="m22 7-10 5L2 7" />
    </Svg>
  ),
  Sparkles: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z" />
      <Path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9Z" />
      <Path d="m5 14 .9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9Z" />
    </Svg>
  ),
  ArrowLeft: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="m12 19-7-7 7-7M19 12H5" />
    </Svg>
  ),
  Map: (p: Props) => (
    <Svg {...defaults(p)}>
      <Path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
      <Path d="M9 3v15M15 6v15" />
    </Svg>
  ),
};
