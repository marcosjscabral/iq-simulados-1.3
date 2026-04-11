---
title: Dashboard Layout
description: Guidance for designing beautiful administrative dashboards and control panels with professional navigation, metric cards, charts, and styled tables, matching the visual tone of the UI Design System skill.
---

# Dashboard Layout Skill

This skill focuses on creating polished administrative dashboards and panel pages using Tailwind CSS and Lucide React.

It is intended for frontend developers and designers who need:
- structured sidebar navigation
- metric cards and KPI tiles
- clean charts and data visualizations
- refined tables and list panels
- a consistent professional layout system

## Focus Areas

1. Dashboard structure
   - Use a clear page hierarchy with sidebar navigation, top actions, and content sections.
   - Prefer grid-based layouts for metrics, charts, and table panels.
   - Keep spacing consistent across sections using Tailwind spacing utilities.

2. Sidebar navigation
   - Build a compact vertical sidebar with grouped navigation links.
   - Include active states, icons, and subtle separators.
   - Keep sidebar surfaces neutral, with strong text contrast and restrained highlights.

3. Metric cards and KPI tiles
   - Use concise cards to surface key performance indicators.
   - Favor simple labels, numeric values, trend indicators, and inline badges.
   - Keep card styling minimal: subtle borders, soft shadows, and moderate corner radii.

4. Charts and visualizations
   - Place charts in clear panels with descriptive titles and supportive labels.
   - Use simple, neutral chart containers to let the data stand out.
   - Avoid overly saturated colors; use muted accents and accessible contrasts.

5. Styled tables and lists
   - Create table panels with clear row separation, heading emphasis, and hover states.
   - Keep table controls consistent: filters, search, pagination, and action buttons.
   - Use subdued borders, alternating row backgrounds, and compact padding.

## Recommended Component Types

- Sidebar menu with icon labels and section grouping.
- KPI card grid with performance metrics and trend badges.
- Chart panel with title, period toggles, and legend.
- Data table panel with header filters and row actions.
- Summary panels for totals, activity feed, and alerts.
- Action bar with buttons, search, and status tags.

## Best Practices

- Use a shared design language with the UI Design System skill: neutral surfaces, medium rounding, and subtle depth.
- Keep dashboards modular: each panel should feel like a distinct visual block.
- Use Tailwind grid utilities for responsive dashboard structure: `grid`, `gap`, `grid-cols`, and `col-span`.
- Keep icons consistent with Lucide React and use them sparingly for navigation and status.
- Prefer low-contrast shadows and border accents over bright glows.
- Emphasize readability with strong type scale, spacing, and whitespace.

## Example Patterns

### Dashboard Sidebar
```tsx
import { Home, BarChart3, Settings, Users } from 'lucide-react';

function DashboardSidebar() {
  return (
    <nav className="flex h-full w-64 flex-col border-r border-white/10 bg-slate-950 px-4 py-6">
      <div className="mb-8 text-sm font-bold uppercase tracking-[0.3em] text-slate-500">Admin Panel</div>
      <ul className="space-y-2 text-sm text-slate-300">
        <li className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm shadow-black/5">
          <a href="#" className="inline-flex items-center gap-3">
            <Home size={18} /> Dashboard
          </a>
        </li>
        <li className="rounded-xl px-4 py-3 hover:bg-slate-900">
          <a href="#" className="inline-flex items-center gap-3">
            <BarChart3 size={18} /> Analytics
          </a>
        </li>
        <li className="rounded-xl px-4 py-3 hover:bg-slate-900">
          <a href="#" className="inline-flex items-center gap-3">
            <Users size={18} /> Users
          </a>
        </li>
        <li className="rounded-xl px-4 py-3 hover:bg-slate-900">
          <a href="#" className="inline-flex items-center gap-3">
            <Settings size={18} /> Settings
          </a>
        </li>
      </ul>
    </nav>
  );
}
```

### Metric Card Grid
```tsx
function MetricsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-slate-950 p-6 shadow-sm shadow-black/10">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue</p>
        <h3 className="mt-4 text-3xl font-black text-white">R$ 312k</h3>
        <p className="mt-2 text-sm text-slate-400">+8.4% from last month</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-950 p-6 shadow-sm shadow-black/10">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active Users</p>
        <h3 className="mt-4 text-3xl font-black text-white">7,842</h3>
        <p className="mt-2 text-sm text-slate-400">Daily active visits</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-950 p-6 shadow-sm shadow-black/10">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tasks</p>
        <h3 className="mt-4 text-3xl font-black text-white">24 Open</h3>
        <p className="mt-2 text-sm text-slate-400">Pending approvals</p>
      </div>
    </div>
  );
}
```

### Table Panel
```tsx
function DataTablePanel() {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 p-6 shadow-sm shadow-black/10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-black text-white">Recent Activity</h2>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          View all
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/5">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/5 hover:bg-slate-900">
              <td className="px-4 py-4">Project Alpha</td>
              <td className="px-4 py-4">Active</td>
              <td className="px-4 py-4">Today</td>
            </tr>
            <tr className="border-t border-white/5 hover:bg-slate-900">
              <td className="px-4 py-4">Campaign B</td>
              <td className="px-4 py-4">Pending</td>
              <td className="px-4 py-4">Yesterday</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Skill Usage

When using this skill, focus on:
- building clean, structured administrative dashboards
- using Tailwind grids and panels for clear content organization
- matching the UI Design System visual tone with neutral surfaces and moderate depth
- using Lucide React icons for navigation and status cues
- keeping components modular and responsive

This skill should guide dashboard implementations for professional admin experiences, with elegant panels, crisp data structure, and consistent navigation.
