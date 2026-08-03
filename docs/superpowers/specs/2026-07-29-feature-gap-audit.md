# Meteostation — Feature Gap Audit & Improvement Roadmap

**Date:** 2026-08-03 (updated)
**Scope:** Product-level analysis of missing features vs user expectations for a personal weather station SaaS.

## Target User

Personal weather hobbyist with one backyard weather station. Wants to check conditions quickly, explore historical data, share with family.

## Current Route Assessment

| Route           | Purpose                                                       | Status                                                                                                     |
| --------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `/`             | Landing page with mock previews                               | Live. Could show live demo-station data.                                                                   |
| `/dash`         | **Personal weather dashboard** — 7 widgets, date range, chart | **Built.** Current conditions, recent measurements (1d/7d/30d/custom), forecast card, map, forecast table. |
| `/measurements` | 7-day hourly table, day drill-down, 2 charts                  | Still useful as detail view. Needs custom date range for parity with dashboard.                            |
| `/forecast`     | ~~Today's forecast card + 7-day table~~                       | **Removed.** Redundant — same components render on `/dash`.                                                |
| `/actions`      | Server-only auth forms                                        | Internal, fine.                                                                                            |

The core problem **solved**: `/dash` now answers "what's the weather at my station right now?" — current conditions, recent trends, today's forecast, and station health at a glance.

---

## Completed

### ✅ 1. Unified personal dashboard

Replaced the station-grid `/dash` with a personal weather dashboard. All 7 widgets on one page:

- **Current Conditions** — big temp, 6 sensor value pills (humidity, pressure, wind, rain, UV index, wind direction)
- **Recent Measurements** — date range presets (1d, 7d, 30d, custom), summary stats (max/min temp, avg humidity, days), dual temp + humidity charts
- **Today's Forecast** — `ForecastCard` component for the current day
- **Station Map** — Leaflet preview with station marker
- **7-Day Forecast Table** — `ForecastTable` with clickable day drill-down
- **Station Header** — name, city, online status spectrum (green/yellow/orange/red)
- **View All Stations** — extracted into a shared `StationList` component, used by both nav station-selector and dashboard

**Spec:** `docs/superpowers/specs/2026-07-29-unified-dashboard-design.md`
**Plan:** `.opencode/plans/2026-07-29-unified-dashboard.md`

### ✅ 2. Custom date range (dashboard)

Date range selector on the dashboard's Recent Measurements widget: 1d, 7d, 30d, and custom range with native HTML date inputs. Uses `api.getMeasurementStats()` with dynamic `from`/`to` params. `placeholderData` prevents flicker when switching ranges.

### ✅ 3. Station online status indicator

Progressive color spectrum: green pulsing (< 5 min) → green (5-30 min) → yellow (30 min-2h) → orange (2-24h) → red (> 24h) → gray (never). Shows relative time text ("Updated 5m ago", "Last seen 2d ago"). Uses static Tailwind class map to avoid dynamic-class issues.

### ✅ 4. Shared station selector

`StationList.svelte` — single shared component for station card grid with search. Used by both nav `station-selector.svelte` and dashboard "View All Stations" dialog. Removed ~110 lines of duplicated card-grid code.

### ✅ 5. Removed `/forecast` route

Forecast page deleted — same `ForecastCard` + `ForecastTable` components already render on the dashboard. Nav link removed. Cleaned up `Cloud` icon import and `routeMap` entry.

### ✅ 6. Measurement fetch parallelization (N+1 fix)

Station-selector and dashboard both use `Promise.allSettled` for parallel per-station measurement fetches instead of sequential loops.

---

## Remaining — Prioritized Future Plan

### Phase 1 — Polish the dashboard (est. 2-3 days)

| #   | Feature                                  | Effort     | Description                                                                                                                                                                              |
| --- | ---------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Wind, pressure, rainfall charts**      | Low        | Add wind speed, pressure, and rainfall bar chart to the Recent Measurements widget. Same `StatsChart` component, different `chartData` + `lineColor`. Currently only temp + humidity.    |
| 2   | **Custom date range on `/measurements`** | Low-Medium | Bring date range selection to the hourly detail page. Add same preset buttons + custom date inputs. Switch query from hardcoded 7-day to dynamic `from`/`to`.                            |
| 3   | **Data export CSV**                      | Low        | "Download CSV" button on the measurements page. Client-side blob generation from the current query data. `timestamp, temperature, humidity, pressure, wind_speed, wind_direction, rain`. |

### Phase 2 — Delight and engagement (est. 1-2 weeks)

| #   | Feature                        | Effort     | Description                                                                                                                                                                                                                                |
| --- | ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4   | **Weather records / extremes** | Medium     | "Your records" panel: hottest day, coldest night, wettest day, highest wind. Requires backend `GET /api/measurements/extremes/` endpoint or client-side aggregation over all measurements. Display as a dashboard widget or separate page. |
| 5   | **Public share link**          | Medium     | Generate read-only URL per station. Backend: share token model + endpoint. Frontend: new `/s/[token]` route with stripped-down dashboard (current conditions, mini chart, forecast). "Copy share link" button on dashboard.                |
| 6   | **Persistent login**           | Low-Medium | Axios request interceptor catches 401 → refreshes token → retries original request. Silently handles token expiry. Debounce concurrent 401s. No more page-flash on token expiry.                                                           |

### Phase 3 — Platform features (est. 2-4 weeks)

| #   | Feature                        | Effort | Description                                                                                                                                                                                                                   |
| --- | ------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7   | **PWA / offline support**      | Medium | `vite-plugin-pwa` for service worker + manifest. `NetworkFirst` for API calls (cache fallback). Offline banner when `navigator.onLine === false`. Install prompt.                                                             |
| 8   | **Threshold alerts (email)**   | High   | Backend: alert rule model (metric, operator, value, enabled). Cron/watchdog checks new measurements against rules, sends email. Frontend: alert settings panel. Alternative: browser Notification API for client-side alerts. |
| 9   | **Year-over-year comparisons** | Medium | "Compare" toggle on measurements. Side-by-side charts for same date range, different years. Summary diff card ("1.2°C warmer than last year").                                                                                |
| 10  | **Weather camera snapshot**    | Low    | Station model: add `camera_url` field. Dashboard widget: `<img>` with auto-refresh (60s interval + cache bust). Fallback placeholder for broken URLs.                                                                         |

---

## Summary — Build Order

| #   | Feature                           | Phase | Effort | Rationale                                                        |
| --- | --------------------------------- | ----- | ------ | ---------------------------------------------------------------- |
| 1   | Wind/pressure/rain charts         | 1     | L      | Doubles information density. Almost zero effort.                 |
| 2   | Custom date range on measurements | 1     | L-M    | Dashboard has it. Measurements page parity.                      |
| 3   | Data export CSV                   | 1     | L      | Expected by data-interested users. Client-side only.             |
| 4   | Weather records                   | 2     | M      | Delightful, shareable, makes the station feel personal.          |
| 5   | Public share link                 | 2     | M      | Organic growth. Friends see station, want one.                   |
| 6   | Persistent login                  | 2     | L-M    | Fixes page-flash on token expiry. Feels polished.                |
| 7   | PWA support                       | 3     | M      | Installable app. Offline. Table-stakes for weather apps.         |
| 8   | Threshold alerts                  | 3     | H      | Proactive monitoring. Highest value of the platform features.    |
| 9   | Year-over-year comparison         | 3     | M      | Climate diary. Niche but deep engagement.                        |
| 10  | Weather camera                    | 3     | L      | Fun feature. Transforms dashboard from numbers to "my backyard." |

---

## Things intentionally excluded

- **Multi-station fleet management** — the app already has multi-station support. This roadmap focuses on the single-station experience (the primary user).
- **Admin panel / user management** — out of scope for a personal hobbyist app.
- **External API integrations** (Weather Underground, OpenWeatherMap) — the station IS the data source.
- **Social features** (comments, likes, station following) — niche. Share link (#5) covers 80% of the social need.
- **Monetization** (paid tiers, limits) — premature. Build value first.
