/**
 * TutorZen Design System — Radii Tokens
 * Aligned with docs/design-system/DESIGN_SYSTEM.md.
 */

export const radii = {
  none: 0,
  sm: 6,
  control: 12, // Input controls, buttons, badges
  card: 20,    // Tactile cards, modal containers
  panel: 28,   // Bottom sheets, major screen sections
  full: 9999,  // Pill badges, avatars
} as const;

export type Radii = typeof radii;

