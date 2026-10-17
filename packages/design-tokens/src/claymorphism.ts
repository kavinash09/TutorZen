/**
 * TutorZen Design System — Claymorphism Surface Tokens
 * Provides subtle tactile elevations and edge highlights adhering to restrained Claymorphism rules.
 * Aligned with docs/design-system/DESIGN_SYSTEM.md and ADR-0006.
 */

export interface ReactNativeShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ClaymorphicStyle extends ReactNativeShadow {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  cssBoxShadow?: string;
}

export const claymorphism = {
  // Level 1: Flat/Subtle tactile card (standard operational cards)
  card: {
    backgroundColor: '#F5F0E7',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    shadowColor: '#20251F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    cssBoxShadow: '0 4px 12px rgba(32, 37, 31, 0.06), inset 0 1px 1px #FFFFFF',
  } satisfies ClaymorphicStyle,

  // Level 2: Raised tactile card (interactive cards, today's schedule hero, active attendance items)
  cardRaised: {
    backgroundColor: '#F5F0E7',
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    shadowColor: '#14351A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 6,
    cssBoxShadow: '0 8px 20px rgba(20, 53, 26, 0.09), inset 0 1.5px 1.5px #FFFFFF',
  } satisfies ClaymorphicStyle,

  // Control: Tactile buttons / interactive controls
  control: {
    backgroundColor: '#1D4A25', // Forest 800
    borderColor: '#235D2F',
    borderWidth: 1,
    shadowColor: '#14351A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    cssBoxShadow: '0 4px 10px rgba(20, 53, 26, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
  } satisfies ClaymorphicStyle,

  // Recessed: Track or inset area (e.g., input field background or progress container)
  recessed: {
    backgroundColor: '#EFE9DE',
    borderColor: '#E5DED2',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    cssBoxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.06)',
  } satisfies ClaymorphicStyle,
} as const;

export type Claymorphism = typeof claymorphism;

