# Design System Unification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Unify the visual language across all pages. Fix dark mode gaps, standardize card patterns, fix hardcoded colors, create a cohesive design.

**Architecture:** Phase 1 establishes a single card pattern and fixes inconsistencies. Phase 2 fixes all dark mode gaps by replacing hardcoded colors with theme tokens. Phase 3 polishes structural details (nav, shadows, spacing).

**Tech Stack:** Svelte 5, Tailwind CSS v4, `@miqal/theme`, shadcn-svelte zinc base.

## Global Constraints

- `pnpm check` must pass (0 errors, 0 warnings) after every task
- `pnpm lint` (Prettier) must pass after every task
- All text uses `$t()` i18n — no hardcoded English strings
- Import path alias `@/*` → `src/lib/*`
- TypeScript strict mode on

## Design Standards (reference for all tasks)

**Unified card pattern:**
`rounded-xl border border-border/50 bg-card p-6 shadow-xs transition-all hover:border-primary/40 sm:p-7`

**Border opacity:** `border-border/50` everywhere

**Shadow scale:**

- Cards: `shadow-xs`
- Dialogs: `shadow-xl` (shadcn default, leave as-is)
- Nav (scrolled): `shadow-lg` (leave as-is)

**Radius:**

- Cards/widgets: `rounded-xl`
- Dialogs: `rounded-lg` (shadcn default, leave as-is)
- Buttons/inputs: `rounded-md` (shadcn default, leave as-is)

---

### Task 1: Phase 1 — Standardize card patterns across all pages

**Files:** `src/routes/dash/+page.svelte`, `src/routes/measurements/+page.svelte`, `src/routes/+page.svelte`, `src/lib/components/measurements/stats-chart.svelte`, `src/lib/components/measurements/stats-table.svelte`, `src/lib/components/forecast/card.svelte`, `src/lib/components/forecast/table.svelte`

- [ ] **Step 1: Dashboard widgets — unify border opacity**

In `src/routes/dash/+page.svelte`, all widget cards currently use `border-border/60`. Change every occurrence to `border-border/50`. There are 4 widget card divs (current conditions, recent measurements, forecast, map).

- [ ] **Step 2: Dashboard — fix `text-[10px]`**

Find all `text-[10px]` in dashboard stat mini-labels (~6 instances inside `bg-muted/50` cells). Replace with `text-[11px]` or add a `leading-tight`.

- [ ] **Step 3: Dashboard — unify grid gap**

Find `gap-5` in the widget grid div. Change to `gap-6` to match homepage and measurements.

- [ ] **Step 4: Measurements page — fix spacing**

Find `<div class="flex w-full flex-col items-center gap-y-6 p-5">` (the root div of measurements). Change `p-5` to `mt-20 px-4 pb-20`.

- [ ] **Step 5: Measurements page — fix skeleton border radius**

Find the skeleton loading divs on the measurements page. Change `rounded-lg` to `rounded-xl` on all 4 skeleton placeholders (the `<Skeleton>` components inside `isPageLoading`).

- [ ] **Step 6: Measurements page — fix status card border opacity**

Find `border-border/50` in status cards (already correct). No change needed — verify they match the standard.

- [ ] **Step 7: Stats chart — fix radius and background**

In `src/lib/components/measurements/stats-chart.svelte`:

- Find `rounded-lg` → `rounded-xl`
- Find `bg-background` → `bg-card`
- Find `border-border/50` (already correct — leave as-is)

- [ ] **Step 8: Stats table — verify consistency**

In `src/lib/components/measurements/stats-table.svelte`, verify `border-border/50` and `rounded-lg`. Change `rounded-lg` → `rounded-xl`.

- [ ] **Step 9: Forecast card — unify border opacity**

In `src/lib/components/forecast/card.svelte`, change `border-border/50` (already correct — leave as-is). Verify `shadow-sm` → change to `shadow-xs` to match other cards. Verify padding: leave `p-5 sm:p-8` as-is (it's intentionally different due to content density).

- [ ] **Step 10: Forecast table container — unify**

In `src/lib/components/forecast/table.svelte`, change `border-border/50` (already correct — leave as-is). Change `shadow-sm` → `shadow-xs`.

- [ ] **Step 11: Homepage feature cards — fix backdrop-blur**

In `src/routes/+page.svelte`, find all 3 instances of `backdrop-blur-xs` on feature cards. Replace with `backdrop-blur-sm`. The class `backdrop-blur-xs` does not exist in Tailwind v4.

- [ ] **Step 12: Homepage — verify border opacity**

Feature cards already use `border-border/60`. Change to `border-border/50` for consistency.

- [ ] **Step 13: Run verification**

```bash
pnpm check && pnpm lint && pnpm format
```

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "style: unify card patterns, fix spacing, standardize border opacity and radius"
```

---

### Task 2: Phase 1 — Extract shared temperature color function

**Files:** `src/lib/components/measurements/table.svelte`, `src/lib/components/measurements/current-day-card.svelte`

- [ ] **Step 1: Read the chart-token-based color function**

In `src/lib/components/measurements/current-day-card.svelte`, find the `getTemperatureColor` function. It uses chart tokens:

```
<= 0 → text-chart-1
<= 15 → text-chart-2
<= 25 → text-primary
<= 32 → text-chart-4
> 32 → text-destructive
```

- [ ] **Step 2: Update `measurements/table.svelte`**

Replace the old hardcoded function (which uses `text-blue-600`, `text-green-500`, etc.) with the same chart-token-based logic used in `current-day-card.svelte`.

- [ ] **Step 3: Run verification**

```bash
pnpm check && pnpm lint
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/measurements/table.svelte
git commit -m "style: unify temperature color function to use chart tokens"
```

---

### Task 3: Phase 2 — Fix dark mode for home/card.svelte

**Files:** `src/lib/components/home/card.svelte`

- [ ] **Step 1: Replace hardcoded zinc colors with theme tokens**

Read the file. Find:

```css
border-zinc-200 bg-white shadow-lg hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900/70
```

Replace with:

```css
border-border bg-card shadow-xs hover:border-primary/40 transition-all hover:shadow-sm
```

Find:

```css
bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-700 dark:ring-zinc-600
```

Replace with:

```css
bg-muted ring-1 ring-border
```

- [ ] **Step 2: Remove unused shadow import/usage**

Remove `shadow-lg` and `hover:shadow-xl` from the component. Use `shadow-xs` matching the standard card pattern.

- [ ] **Step 3: Run verification**

```bash
pnpm check && pnpm lint && pnpm format
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/home/card.svelte
git commit -m "fix: use theme tokens in home card, fix dark mode"
```

---

### Task 4: Phase 2 — Fix hardcoded icon colors in dashboard

**Files:** `src/routes/dash/+page.svelte`

- [ ] **Step 1: Add dark mode variants to all 6 stat icons**

Find these lines in the Current Conditions widget (stat pill grid):

```
<Droplets class="size-4 text-cyan-500" />
<Gauge class="size-4 text-slate-500" />
<Wind class="size-4 text-sky-500" />
<CloudRain class="size-4 text-blue-500" />
<Sun class="size-4 text-amber-500" />
<MapPin class="size-4 text-emerald-500" />
```

Add `dark:` variants that look good on dark backgrounds:

```
<Droplets class="size-4 text-cyan-500 dark:text-cyan-400" />
<Gauge class="size-4 text-slate-400 dark:text-slate-300" />
<Wind class="size-4 text-sky-500 dark:text-sky-400" />
<CloudRain class="size-4 text-blue-500 dark:text-blue-400" />
<Sun class="size-4 text-amber-500 dark:text-amber-400" />
<MapPin class="size-4 text-emerald-500 dark:text-emerald-400" />
```

- [ ] **Step 2: Run verification**

```bash
pnpm check && pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/dash/+page.svelte
git commit -m "fix: add dark mode variants to dashboard stat icon colors"
```

---

### Task 5: Phase 2 — Fix forecast mini-card dark mode + badge + humidity bar

**Files:** `src/lib/components/forecast/mini-card.svelte`, `src/lib/components/ui/badge/badge.svelte`, `src/lib/components/measurements/table.svelte`

- [ ] **Step 1: Fix forecast mini-card dark mode gaps**

In `src/lib/components/forecast/mini-card.svelte`, add dark variants to the two icon colors lacking them:

- `text-orange-500` → `text-orange-500 dark:text-orange-400`
- `text-blue-500` → `text-blue-500 dark:text-blue-400`

The `text-cyan-600 dark:text-cyan-400` already has a dark variant — leave as-is.

- [ ] **Step 2: Fix badge destructive variant**

In `src/lib/components/ui/badge/badge.svelte`, find `text-white` on the destructive variant. Replace with `text-destructive-foreground`.

- [ ] **Step 3: Fix measurements table humidity bar**

In `src/lib/components/measurements/table.svelte`, find the humidity progress bar div with `bg-blue-500`. Replace with `bg-chart-1` (theme token that adapts to dark mode).

- [ ] **Step 4: Run verification**

```bash
pnpm check && pnpm lint && pnpm format
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/forecast/mini-card.svelte src/lib/components/ui/badge/badge.svelte src/lib/components/measurements/table.svelte
git commit -m "fix: dark mode gaps in mini-card, badge, and humidity bar"
```

---

### Task 6: Phase 3 — Nav consistency + shadow polish

**Files:** `src/routes/dash/+page.svelte`, `src/routes/+page.svelte`

- [ ] **Step 1: Standardize backdrop blur**

Audit all `backdrop-blur-*` usage across the codebase:

- `backdrop-blur-xs` → already replaced in Task 1
- `backdrop-blur-sm` → keep on cards (forecast card, chart overlays)
- `backdrop-blur-md` → keep on nav/footer (sticky elements)

Verify the pattern: cards use `sm`, sticky elements use `md`. No `xs` or `lg` remaining.

- [ ] **Step 2: Ensure shadow consistency on all cards**

Verify every card (dashboard widgets, homepage features, forecast cards, station list cards) uses `shadow-xs` with optional `hover:shadow-sm` on hover. The shadcn `Card.Root` uses `shadow-sm` — can leave as-is (shadcn default), but ensure the page-level cards around it are `shadow-xs`.

- [ ] **Step 3: Run verification**

```bash
pnpm check && pnpm lint
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style: standardize backdrop blur scale and shadow consistency"
```

---

### Task 7: Phase 3 — Station list card consistency

**Files:** `src/lib/components/station/station-list.svelte`

- [ ] **Step 1: Match station list cards to standard pattern**

In `src/lib/components/station/station-list.svelte`, the station cards use `border-border` (full opacity) and `p-4` with no responsive padding.

Change each card:

- `border-border` → `border-border/50`
- `p-4` → `p-6 sm:p-7` (or at least `p-5 sm:p-6` to fit the dialog context)
- Add `shadow-xs`

- [ ] **Step 2: Unify skeleton radius in station list**

Find skeleton placeholders in the station list. Change `rounded-md` to `rounded-lg` on skeleton shapes (matching the card's `rounded-xl`).

- [ ] **Step 3: Run verification**

```bash
pnpm check && pnpm lint && pnpm format
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/station/station-list.svelte
git commit -m "style: standardize station list card to unified card pattern"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full verification**

```bash
pnpm check && pnpm lint && pnpm build
```

All three must pass with 0 errors, 0 warnings.

- [ ] **Step 2: Visual check**

Verify these things in the browser:

- All cards have the same border opacity, shadow, and radius
- Dark mode has no broken colors (switch theme in nav)
- Measurements page has proper spacing (not cramped)
- Loading skeletons have consistent radius
- Stats charts use card background (not page background)
- Backdrop blur is visible on cards (not broken `xs` variant)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: final design unification verification"
```
