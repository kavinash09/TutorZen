/**
 * TutorZen Design System — Typography Tokens
 * Headings: EB Garamond (Prominent / Editorial)
 * Body & Controls: Barlow (Operational UI, Forms, Navigation, Tables)
 * Aligned with docs/design-system/DESIGN_SYSTEM.md and ADR-0006.
 */

export const typography = {
  fonts: {
    heading: 'EBGaramond_600SemiBold',
    headingRegular: 'EBGaramond_400Regular',
    headingBold: 'EBGaramond_700Bold',
    body: 'Barlow_400Regular',
    bodyMedium: 'Barlow_500Medium',
    bodySemiBold: 'Barlow_600SemiBold',
    bodyBold: 'Barlow_700Bold',
  },

  fontFamilies: {
    heading: 'EB Garamond, Georgia, serif',
    body: 'Barlow, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 26,
    xl: 28,
    '2xl': 32,
    '3xl': 38,
    '4xl': 44,
  },

  fontWeights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
} as const;

export type Typography = typeof typography;

