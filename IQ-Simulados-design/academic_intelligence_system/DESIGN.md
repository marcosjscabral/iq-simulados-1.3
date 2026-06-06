---
name: Academic Intelligence System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#464554'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#595c5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#727577'
  on-tertiary-container: '#fbfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max-width: 1280px
---

## Brand & Style

The design system is engineered for a high-performance exam platform that balances academic rigor with cutting-edge technology. The brand personality is **authoritative yet encouraging**, aiming to reduce student anxiety through clarity and structured information. 

The visual style is **Corporate Modern with a Minimalist influence**. It shifts away from heavy, dark aesthetics to a light-filled, airy interface that prioritizes focus. Key attributes include:
- **Precision:** Clean lines and a strict grid communicate reliability and accuracy.
- **Intelligence:** Subtle AI-focused elements like crystalline icons and soft, glowing active states.
- **Clarity:** Generous whitespace ensures that complex exam data and questions remain the primary focus.

## Colors

The palette is centered on a **Vibrant Deep Purple** that serves as the primary driver for action and identity. This is paired with a sophisticated **Slate Blue** for secondary information and structural elements.

- **Primary (Deep Purple):** Used for buttons, progress indicators, and primary branding. It should feel energetic but stable.
- **Secondary (Slate Blue):** Used for secondary text, icons, and non-primary buttons.
- **Backgrounds:** A tiered system of whites and very soft grays (`#F8FAFC`) to create depth without relying on heavy borders.
- **High Contrast:** All body text must maintain a high contrast ratio against backgrounds to ensure legibility during long study sessions.

## Typography

The design system utilizes **Inter** for its exceptional legibility and neutral, professional character. The typographic scale is designed to handle high-density information (like exam questions) while maintaining a clear hierarchy.

- **Scale:** Employs a tight scale for body text and labels to keep interfaces compact, but uses bold, large display sizes for headers to provide clear section entry points.
- **Readability:** Line heights for body text are set to 1.5x minimum to prevent eye fatigue during reading.
- **Weight:** Use Semibold (600) for interactive elements and Medium (500) for labels to distinguish them from standard body copy.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to maintain structural integrity, transitioning to a fluid model for mobile.

- **Grid:** A 12-column grid is used for the main dashboard. Content cards typically span 3, 4, or 6 columns.
- **Spacing Rhythm:** Based on an 8px base unit. Component internal padding should be generous (24px for large cards, 16px for smaller items).
- **Whitespace:** Use whitespace as a separator rather than lines whenever possible. This "airy" approach keeps the platform from feeling cluttered.
- **Mobile Adaption:** At the 768px breakpoint, margins shrink to 16px and the grid collapses to a single column for exam questions to maximize reading width.

## Elevation & Depth

Depth is achieved through **Ambient Shadows** and **Tonal Layering**, avoiding the flat, heavy aesthetic of the previous version.

- **Surfaces:** The main background is the lowest tier (`#F8FAFC`). Content is placed on white cards (`#FFFFFF`).
- **Shadows:** Use a "Soft-Focus" shadow style. Shadows should be ultra-diffused with a low opacity (8-10%) and a slight blue-tinted gray (`#475569`) to prevent them from looking "dirty."
- **Interactive Depth:** On hover, cards should slightly lift (increased shadow spread and y-offset) to provide tactile feedback without utilizing heavy outlines.
- **Focus States:** Active elements utilize a subtle outer glow in the primary purple color rather than a standard browser ring.

## Shapes

The design system uses a **Rounded** aesthetic to soften the academic environment and make the tech feel more approachable.

- **Base Corner Radius:** 12px-16px for all primary cards and containers.
- **Component Radius:** Buttons and inputs follow a 8px-12px radius to maintain consistency with the cards.
- **Consistency:** Avoid mixing sharp and rounded corners; every element from progress bars to profile images should adhere to the rounded logic.

## Components

### Buttons
- **Primary:** Solid Deep Purple background with white text. High-contrast, bold, 12px rounded corners.
- **Secondary:** Slate Blue outline with transparent background or soft gray fill.
- **Tertiary:** Text-only with an underline or subtle background shift on hover for navigation.

### Cards
- White background, 16px rounded corners, and soft ambient shadows. 
- Use horizontal layouts for "simulados" list items to allow for clear metadata (number of questions, price, time) to be aligned.

### Chips / Badges
- Used for categories (e.g., "Polícia", "Tribunais"). 
- Lightly tinted backgrounds of the primary color with dark text for high legibility.

### Input Fields
- Soft gray borders (`#E2E8F0`) that turn primary purple on focus.
- 12px roundedness to match the card style.

### Progress Indicators
- Use the primary purple for completion bars. Incorporate a "glow" effect on the leading edge of the progress bar to suggest AI-driven movement and activity.

### Navigation (Sidebar)
- Move away from the dark background. Use a light sidebar with icons in Slate Blue, switching to Deep Purple for the active state with a subtle left-hand indicator bar.