/**
 * @tutorzen/design-tokens
 * Core design system tokens for TutorZen.
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radii';
export * from './claymorphism';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { claymorphism } from './claymorphism';

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  claymorphism,
} as const;

export type Theme = typeof theme;
export default theme;

