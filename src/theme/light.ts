// src/theme/light.ts
// Pastel palette (videoinfographica colors #56) with coral pink as the brand.
import { space, radius, typography, elevation, type Tokens } from './tokens';

export const lightTokens: Tokens = {
  color: {
    bg:        '#FFFFFF',
    bgSubtle:  '#FAF1D6', // cream — selected states, input rests
    surface:   '#FFFFFF',
    border:    '#FADEE1', // pale pink border — softer than neutral gray, matches palette
    text:      '#1A1A1A',
    textMuted: '#6B7280',
    primary:   '#FDAFAB', // coral pink — main brand
    onPrimary: '#1A1A1A', // dark text on pink (white fails contrast on a pastel)
    accent:    '#B6E3E9', // light teal — secondary accent for info / chips
    success:   '#22C55E',
    danger:    '#E11D48', // deeper rose, distinct from primary pink
    warning:   '#FAD4AE', // peach — from palette
  },
  space, radius, typography, elevation,
};
