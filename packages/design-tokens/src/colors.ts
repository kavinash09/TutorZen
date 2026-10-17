/**
 * TutorZen Design System — Color Tokens
 * Aligned with docs/design-system/DESIGN_SYSTEM.md and ADR-0006.
 */

export const colors = {
  // Primary brand palette (Restrained Forest Green)
  forest: {
    950: '#14351A',
    800: '#1D4A25',
    700: '#235D2F',
    500: '#2F7D3E',
    100: '#E7F0E9',
    50: '#F3F7F4',
  },

  // Surfaces & Backgrounds
  surface: {
    paper: '#FDFBF7',   // Primary canvas / background
    elevated: '#F5F0E7', // Card and panel claymorphic background
    muted: '#EFE9DE',    // Recessed background / track
    subtle: '#FAF7F2',   // Secondary elevated layer
  },

  // Typography & Content
  ink: {
    primary: '#20251F',   // Main body & high-contrast headings
    secondary: '#4A524A', // Secondary readable text
    muted: '#646B64',     // Tertiary / captions / labels
    inverse: '#FFFFFF',   // On dark forest surfaces
  },

  // Borders & Separators
  border: {
    subtle: '#E5DED2',
    strong: '#D4CBBF',
    focus: '#1D4A25',
  },

  // Semantic Status Colors
  status: {
    success: '#237A45',
    successLight: '#EAF5EE',
    warning: '#9A6700',
    warningLight: '#FEF7E6',
    danger: '#B42318',
    dangerLight: '#FEE4E2',
    info: '#175CD3',
    infoLight: '#EFF8FF',
  },

  // Pure Utilities
  common: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
} as const;

export type Colors = typeof colors;

