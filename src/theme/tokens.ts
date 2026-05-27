// src/theme/tokens.ts
// Token scales that don't change between themes. Color scales live in light.ts / dark.ts.

export const space = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48,
} as const;

export const radius = {
  none: 0, sm: 6, md: 10, lg: 16, xl: 24, pill: 999,
} as const;

export const typography = {
  size:   { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, display: 34 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { tight: 1.2, normal: 1.4, loose: 1.6 },
} as const;

export const elevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  sm:   { shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  md:   { shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
} as const;

export type Tokens = {
  color: {
    bg:        string;
    bgSubtle:  string;
    surface:   string;
    border:    string;
    text:      string;
    textMuted: string;
    primary:   string;
    /** Text color used on primary-color backgrounds (e.g., the Button primary variant). */
    onPrimary: string;
    /** Secondary accent — used for info badges, link accents, secondary tabs. */
    accent:    string;
    success:   string;
    danger:    string;
    warning:   string;
  };
  space: typeof space;
  radius: typeof radius;
  typography: typeof typography;
  elevation: typeof elevation;
};
