# TutorZen Design System

## Design intent

Calm, approachable, modern, and operationally clear. Use Claymorphism as a surface treatment, not as an excuse to decorate every control. The UI should feel tactile while keeping information density, accessibility, and speed of task completion.

## Typography

- Display/heading: **EB Garamond**.
- Functional/body: **Barlow**.
- Avoid loading duplicate font files across app entry points.
- Define a single source of typography tokens and use it consistently.
- Verify font loading and fallback behavior on iOS and Android.

Suggested web-style tokens for translation into the actual platform's theme API:

```css
:root {
  --font-heading: "EB Garamond", Georgia, serif;
  --font-body: "Barlow", Arial, sans-serif;

  --color-forest-950: #14351A;
  --color-forest-800: #1D4A25;
  --color-forest-100: #E7F0E9;
  --color-paper: #FDFBF7;
  --color-surface: #F5F0E7;
  --color-ink: #20251F;
  --color-muted: #646B64;
  --color-border: #E5DED2;
  --color-danger: #B42318;
  --color-warning: #9A6700;
  --color-success: #237A45;

  --radius-control: 12px;
  --radius-card: 20px;
  --radius-panel: 28px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}
```

These are initial design proposals. Check contrast and platform appearance before production adoption. Translate tokens into React Native/TypeScript constants rather than assuming CSS is used.

## Claymorphism rules

- Use warm neutral backgrounds and a restrained forest-green primary action.
- Use soft shadows and subtle highlights on selected cards and controls.
- Keep text on high-contrast, mostly flat surfaces.
- Avoid multiple heavy shadows stacked on top of one another.
- Avoid inset shadows on text inputs if they reduce clarity.
- Do not use color alone to communicate attendance/payment states.
- Avoid card-within-card nesting unless it improves grouping.
- Provide visible press, focus, disabled, loading, success, and error states.
- Prefer small, consistent iconography and clear labels over unlabeled icons.
- Respect system font scaling, safe areas, and reduced motion.
- Ensure tap targets are comfortable (aim for at least 44pt on iOS / 48dp on Android where feasible).

## Components to standardize

- Screen shell and page header
- Primary, secondary, and destructive buttons
- Text field, password field, search field, dropdown/select
- Tabs and segmented controls
- Surface/card and section header
- List row and avatar
- Status badge with text/icon
- Empty, loading, error, offline, and retry states
- Confirmation dialog/bottom sheet
- Attendance method selector
- Sync status and conflict-resolution row
- Fee/payment status row
- Accessible chart and summary metric

## UX quality gates

- A user can identify the main action quickly.
- Important tasks do not depend on color alone.
- Screen reader labels and logical focus order are present.
- Forms show inline validation and preserve user input on recoverable errors.
- Destructive actions have clear confirmation or undo where appropriate.
- Offline state is visible when it affects task outcomes.
- Motion is purposeful and not required to understand a state.
- Verify layouts on narrow screens and with large text settings.
