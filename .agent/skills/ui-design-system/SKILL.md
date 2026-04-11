---
title: UI Design System
description: Development of a centralized Design System to ensure visual and functional consistency across the app's ecosystem. The system standardizes essential components such as color palette, typography, buttons, and interface elements, optimizing the design flow and ensuring a cohesive user experience.
---

# UI Design System Skill

This skill provides guidance for building professional web interfaces using Tailwind CSS and Lucide React.

It is intended for React developers and designers creating polished applications with:
- disciplined spacing and typography
- structured responsive grids
- reusable components for professional layouts
- modern iconography through Lucide React
- accessible and maintainable UI patterns

## Focus Areas

1. Tailwind CSS utility-first design
   - Use Tailwind classes for layout, spacing, color, typography, and state styles.
   - Prefer reusable class patterns and component variants over inline styling.
   - Keep styles consistent with the app's color palette and spacing scale.

2. Lucide React icon integration
   - Use Lucide React icons as components: `<Save size={20} />`, `<Search className="text-slate-400" />`.
   - Keep icons semantically meaningful, well-sized, and visually balanced.
   - Add accessible labels when icons are interactive.

3. Professional layout systems
   - Build structured grids, card groups, dashboard panels, and content sections with strong visual hierarchy.
   - Use subtle neutral surface tones, low-key borders, and restrained shadows.
   - Avoid very rounded corners and bright blue drop shadows; prefer medium corner radii and soft depth.

4. Modern UX and accessibility
   - Use semantic HTML elements (`button`, `section`, `header`, `nav`, `form`).
   - Include focus-visible states and keyboard-friendly interactions.
   - Support responsive breakpoints across mobile, tablet, and desktop.

## Recommended Component Types

- Button variants: primary, secondary, ghost, danger, disabled.
- Grid layouts: card grid, stats grid, feature matrix, dashboard panels.
- Card components: media header, details, actions, badge.
- Input fields: text, textarea, select, checkbox, radio.
- Modal / drawer: overlay, panel, close action.
- Data display: stats, progress, tables, steps.
- Navigation: tabs, sidebar, breadcrumb, top bar.

## Best Practices

- Use a shared Tailwind config for colors, fonts, spacing, and breakpoints.
- Create abstractions for repeated patterns such as `Button`, `Card`, `InfoChip`, and `GridSection`.
- Keep logic and layout separated: component props should control variation.
- Use concise, descriptive class names when composing utilities.
- Prefer `group`, `hover:`, `focus:`, and `transition` utilities for interactive states.
- Use moderate corner radii (e.g. `rounded-xl` or `rounded-lg`) instead of extreme rounding.
- Use neutral shadows and subtle borders rather than saturated blue glows.
- Favor structured grid layouts for professional content organization.

## Example Patterns

### Tailwind + React Button
```tsx
import { ArrowRight } from 'lucide-react';

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition duration-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/30">
      {children}
      <ArrowRight size={18} />
    </button>
  );
}
```

### Professional Content Grid
```tsx
function DashboardGrid() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-slate-950 p-6 shadow-sm shadow-black/10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Performance</p>
        <h2 className="mt-4 text-3xl font-black text-white">82.4%</h2>
        <p className="mt-2 text-sm text-slate-400">Conversion rate over the last 30 days.</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-950 p-6 shadow-sm shadow-black/10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Revenue</p>
        <h2 className="mt-4 text-3xl font-black text-white">R$ 124k</h2>
        <p className="mt-2 text-sm text-slate-400">Monthly recurring revenue with stable growth.</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-950 p-6 shadow-sm shadow-black/10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Tasks</p>
        <h2 className="mt-4 text-3xl font-black text-white">14 Open</h2>
        <p className="mt-2 text-sm text-slate-400">Active projects and follow-up items.</p>
      </div>
    </section>
  );
}
```

## Skill Usage

When using this skill, focus on:
- producing modern and professional interface layouts
- enforcing consistent spacing, typography, and icon usage
- using Tailwind utilities for responsive and structured grids
- wrapping Lucide React icons in accessible controls
- avoiding excessive rounding and saturated blue shadows

This skill should guide UI implementation for professional web products with clean structure, refined surfaces, and effective layout systems.

