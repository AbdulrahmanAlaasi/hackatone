export const tokens = {
  color: {
    primary: '#FF8A3D',
    primaryPressed: '#E96F26',
    secondary: '#FFD166',
    background: '#FFF8EF',
    surface: '#FFFFFF',
    surfaceSoft: '#FFE8D6',
    text: '#2B2B2B',
    textMuted: '#77716A',
    success: '#7BCFA6',
    successText: '#226B49',
    warning: '#FFB199',
    warningText: '#9B3D20',
    info: '#CFE8FF',
    border: '#E8DED4',
    disabled: '#EDE7DF',
    disabledText: '#AAA199',
  },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 12: 48 } as const,
  radius: { xs: 6, sm: 8, md: 16, lg: 24, xl: 32, full: 999 } as const,
  font: {
    family: undefined, // RN uses system font; load Nunito Sans via expo-font in Prompt 7
    size: {
      display: 32,
      h1: 28,
      h2: 22,
      h3: 18,
      bodyLg: 17,
      body: 15,
      label: 13,
      caption: 12,
      tiny: 11,
    },
    weight: {
      regular: '400',
      medium: '500',
      bold: '700',
      extraBold: '800',
      black: '900',
    } as const,
  },
};

export type Tokens = typeof tokens;
