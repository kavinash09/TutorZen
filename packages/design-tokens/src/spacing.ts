/**
 * TutorZen Design System — Spacing Tokens
 * 4px base increment grid.
 * Aligned with docs/design-system/DESIGN_SYSTEM.md.
 */

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type Spacing = typeof spacing;

