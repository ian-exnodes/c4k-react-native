// src/theme/dark.ts
// Pink-forward dark mode. The pastel pink primary pops nicely against the
// near-black surfaces; the text on it stays dark for AA contrast.
import { space, radius, typography, elevation, type Tokens } from './tokens';

export const darkTokens: Tokens = {
  color: {
    bg:        '#15161A',
    bgSubtle:  '#1F2026',
    surface:   '#1A1B20',
    border:    '#2A2B31',
    text:      '#FAF1D6', // warm cream — pairs with the pastel brand
    textMuted: '#9CA3AF',
    primary:   '#FDAFAB',
    onPrimary: '#1A1A1A',
    accent:    '#B6E3E9',
    success:   '#22C55E',
    danger:    '#F87171',
    warning:   '#FAD4AE',
  },
  space, radius, typography, elevation,
};
