# Meteostation — Feature Gap Audit & Improvement Roadmap

**Date:** 2026-07-29
**Scope:** Product-level analysis of missing features vs user expectations for a personal weather station SaaS.

## Target User

Personal weather hobbyist with one backyard weather station. Wants to check conditions quickly, explore historical data, share with family.

## Current Route Assessment

| Route           | Purpose                                                        | Verdict                                                                    |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `/`             | Landing page with mock previews                                | Makes sense. Could show live demo-station data.                            |
| `/dash`         | Station grid + per-station cards with map thumbnails           | Overbuilt for 1 station. Station management page, not a weather dashboard. |
| `/measurements` | Last 7 days — 2 charts (temp + humidity), day drill-down table | Core feature. Should be the main dashboard hub.                            |
| `/forecast`     | Today's forecast card + 7-day table                            | Good feature. Duplicate map. Disconnected from measurements.               |
| `/actions`      | Server-only auth forms                                         | Internal, fine.                                                            |

The core problem: **no single page answers "what's the weather at my station right now?"** — the fundamental question a hobbyist opens the app to answer.

---

## P0 — Fundamental UX fixes

### 1. Unified personal dashboard

**Impact:** Replaces the current `/dash` station-grid with a proper weather dashboard for the selected station. Current conditions, today's extremes, mini forecast, 24h trend chart — all on one page.

**Effort:** Medium (~250 lines, 2 files). No backend changes.

**Why P0:** The `/dash` page is currently dead weight for a single-station user. This single change transforms the app from "station management tool" to "personal weather dashboard."

**Spec:** See `docs/superpowers/specs/2026-07-29-unified-dashboard-design.md`

---

### 2. Custom date range on measurements

**Impact:** Replace the hardcoded "last 7 days" on `/measurements` with a date range picker. User picks "last 30 days," "this month," "July 2025" — or drag-selects a custom range. The API already supports `timestamp__gt`/`timestamp__lt` filters.

**Effort:** Low-Medium. Add two date inputs or a range picker component to the measurements page. Switch from `weekStatsQuery` (daily aggregates endpoint) to `measurementsQuery` (raw measurements endpoint) for arbitrary ranges. The measurements table already supports pagination with `count` and `pageNumber`.

**Considerations:**

- Daily aggregate views for ranges > 7 days to avoid chart clutter
- Preset quick-select buttons: "7 days," "30 days," "This month," "This year"
- URL query param for date range (shareable/bookmarkable)
- Cache per date range via query key: `['measurements', stationId, from, to, page]`

---

## P1 — Quick wins

### 3. Wind, pressure, and rainfall charts

**Impact:** The API returns `wind_speed`, `wind_direction`, `pressure`, `rain` — but only temperature and humidity are charted on `/measurements`. Adding wind speed, pressure trend, and rainfall bar chart gives the full weather picture.

**Effort:** Low. The `StatsChart` component (`measurements/stats-chart.svelte`) already renders a spline chart from `ChartData[]`. Adding more charts means duplicating it with different `chartData` mappings and `lineColor` values.

**Implementation:**

- Wind speed: line chart, blue
- Pressure: line chart with fine scale (980–1040 hPa), purple
- Rainfall: bar chart or stacked bars below the temperature chart
- Wind direction: wind rose (requires `d3-shape` arc or custom SVG — medium effort) or simple compass arrow

**Recommended first pass:** Wind + pressure as line charts. Rainfall as a bar chart overlay on the temperature chart. Skip wind rose for P2.

---

### 4. Station online status indicator

**Impact:** Show "Last data: 3 min ago" or a red dot if station hasn't reported recently. The user immediately knows if their station is down.

**Effort:** Very Low. ~20 lines in the nav bar or dashboard header.

**Implementation:**

```
const age = dayjs().diff(latestMeasurement.timestamp, 'minute');
```

| Age            | Dot color | Pulse | Text               |
| -------------- | --------- | ----- | ------------------ |
| < 5 min        | Green     | Yes   | "Updated just now" |
| 5–30 min       | Green     | No    | "Updated 15m ago"  |
| 30 min–2 hours | Yellow    | No    | "Updated 1h ago"   |
| 2–24 hours     | Orange    | No    | "Last seen 5h ago" |
| > 24 hours     | Red       | No    | "Last seen 2d ago" |
| Never          | Gray      | No    | "No data received" |

Show as a compact badge in the station selector or as part of the dashboard header. Already designed into the unified dashboard (P0 #1).

---

### 5. Data export (CSV/JSON)

**Impact:** Download the currently visible date range as a CSV file. A hobbyist's first instinct is to play with their data in Excel.

**Effort:** Low. Client-side generation from existing query data. No backend needed.

**Implementation:**

- "Download CSV" button on `/measurements` page (visible when data is loaded)
- Generate CSV from the current query data: `timestamp, temperature, humidity, pressure, wind_speed, wind_direction, rain`
- Use `Blob` + `URL.createObjectURL` + hidden `<a download>` click pattern
- File name: `meteostation-<station>-<from>-<to>.csv`
- Option: "Download JSON" for the raw API response (dev-friendly)

---

## P2 — Worth building next

### 6. Weather records / extremes

**Impact:** "Your records" section: hottest day ever, coldest night, wettest day, highest wind, highest pressure. Hobbyists love personal extremes — it makes the weather station feel like a personal weather diary.

**Effort:** Medium. Requires aggregation across ALL measurements for a station (or a backend endpoint). For a personal station with reasonable history (< 100k rows), client-side computation could work with a batched fetch.

**UI:** A separate "Records" card on the dashboard or a dedicated `/records` page. Shows:

- Hottest day: 36.2°C on Aug 12, 2024
- Coldest night: -12.1°C on Jan 23, 2024
- Wettest day: 45mm on Jun 8, 2025
- Highest wind: 42 km/h on Mar 14, 2025
- Highest pressure: 1042 hPa on Dec 3, 2024
- Lowest pressure: 978 hPa on Feb 28, 2025

**Backend consideration:** Needs `GET /api/measurements/extremes/?station=X` endpoint returning min/max aggregates. Alternative: fetch all measurements and compute client-side (fine for a personal station).

---

### 7. Public share link

**Impact:** Generate a read-only URL for your station. Share with family or embed on a personal website. No auth required to view. Drives organic growth — friends see your station and want their own.

**Effort:** Medium. Requires backend support for share tokens. Frontend adds a public route.

**Implementation:**

- Backend: `POST /api/stations/<id>/share/` → generates unique token, returns `{ share_url: "/s/<token>" }`
- Backend: `GET /api/stations/share/<token>/` → returns station data + latest measurement + forecast (no auth)
- Frontend: new `/s/[token]` route showing a stripped-down dashboard:
  - Station name, city
  - Current conditions (big temp, humidity)
  - Mini 24h temperature chart
  - Today's forecast summary
  - "Powered by Meteostation" footer link
- "Share" button on the dashboard generates the link, copies to clipboard

---

### 8. Threshold alerts (email)

**Impact:** Set rules like "email me when temperature < 0°C" or "when wind > 30 km/h." Turns passive monitoring into proactive awareness.

**Effort:** High. Significant backend work. Frontend is a settings panel.

**Implementation:**

- Backend: alert rules model (user, station, metric, operator, value, enabled)
- Backend: cron/watchdog that checks new measurements against rules, sends email
- Frontend: Alert settings page or dialog:
  - Metric selector: Temperature, Humidity, Wind, Rain, Pressure
  - Operator: Above, Below
  - Value input
  - Toggle on/off
  - Email address field (pre-filled from user account)
- Email delivery: existing Django email backend or a transactional email service

**Simpler alternative:** Client-side threshold highlighting — color the temperature red when below 0°C, send a browser notification via the Notifications API. No backend needed, but only works when the app is open.

---

### 9. PWA / offline support

**Impact:** Installable app with a home screen icon. Cached last-known data for offline viewing. Weather apps are the #1 PWA use case — people check them habitually like checking the time.

**Effort:** Medium. `vite-plugin-pwa` handles the heavy lifting. Need a service worker strategy and a manifest.

**Implementation:**

- Add `vite-plugin-pwa` to Vite config
- Generate `manifest.json`: name, icons, theme_color, display: standalone
- Service worker: `NetworkFirst` for API calls (serve cache when offline, update from network when online), `CacheFirst` for static assets
- Offline UI: if `navigator.onLine === false`, show a banner "You're offline. Showing cached data from X ago."
- Install prompt: `beforeinstallprompt` event → "Add to Home Screen" button
- Push notifications: optional enhancement for alerts (P2 #8 synergy)

---

### 10. Persistent login

**Impact:** The JWT refresh flow currently requires a full page reload when the access token expires (hooks redirects with 308). User sees a flash, page reloads. Replace with a background refresh — user never sees a login screen again unless they explicitly log out.

**Effort:** Low-Medium. Add a request interceptor to the Axios instance that catches 401 responses, calls `refreshJwt`, retries the original request with the new token, and updates the cookie.

**Implementation:**

- Axios response interceptor: on 401 → attempt refresh → retry original request
- If refresh also fails → redirect to `/` with auth dialog open
- Store refresh promise to debounce concurrent 401s (multiple widgets fail simultaneously → only one refresh call)
- The server-side hook (`hooks.server.ts`) remains as-is for SSR — this is purely a client-side enhancement

**Synergy with P0 #1:** The dashboard fires 4 queries simultaneously. If the token expired, without this fix, the user sees 4 failures + a page reload. With this fix, one silent refresh handles all 4.

---

### 11. Year-over-year comparisons

**Impact:** Select "July 2025 vs July 2024" and see side-by-side charts. Great for "was last summer really hotter?" debates. Turns the weather station into a climate diary.

**Effort:** Medium. UI for dual-date-range picker + dual-chart layout. Backend can use the same endpoints with different date ranges.

**Implementation:**

- "Compare" toggle on `/measurements`
- Second date range picker appears. Default: same range, previous year.
- Two `StatsChart` components side-by-side: "This year" vs "Last year"
- Color palette: primary for current range, muted accent for comparison
- Summary diff card: "This July was 1.2°C warmer than July 2025"

---

### 12. IP camera snapshot

**Impact:** Hobbyists often have weather cameras (Raspberry Pi + camera module, IP camera, etc.). Show the latest image from a URL alongside weather data. Transforms the dashboard from "numbers" to "my backyard right now."

**Effort:** Low. Config field for camera URL, `<img>` tag with `?t=<timestamp>` cache-busting.

**Implementation:**

- Station model (backend): add `camera_url` field (optional, validated as URL)
- Station dialog (frontend): add "Camera URL" input to station settings
- Dashboard: "Webcam" widget showing the latest image from the URL
  - Auto-refresh: `<img src={url}?t={Date.now()}>` updated every 60 seconds via `setInterval`
  - Fallback: broken image → "Camera unavailable" placeholder
  - Privacy: only show if logged in (camera URLs may be private)

---

## Summary — Recommended Build Order

| #   | Feature                   | Tier | Effort | Rationale                                                             |
| --- | ------------------------- | ---- | ------ | --------------------------------------------------------------------- |
| 1   | Unified dashboard         | P0   | M      | Fixes the fundamental UX. No page answers "what's my weather?" today. |
| 2   | Custom date ranges        | P0   | L-M    | Unlocks historical exploration. Hardcoded 7-day is crippling.         |
| 3   | Wind/pressure/rain charts | P1   | L      | Doubles information density for almost no effort.                     |
| 4   | Station online status     | P1   | VL     | 20 lines of code. Huge peace of mind. Ships inside #1.                |
| 5   | Data export CSV           | P1   | L      | Expected by any data-interested user. Client-side only.               |
| 6   | Weather records           | P2   | M      | Delightful, shareable, makes the station feel personal.               |
| 7   | Public share link         | P2   | M      | Organic growth. Friends see station, want one too.                    |
| 8   | Threshold alerts          | P2   | H      | Major effort requiring backend. Highest user value of P2.             |
| 9   | PWA support               | P2   | M      | Installable app. Cached offline. Table-stakes for weather apps.       |
| 10  | Persistent login          | P2   | L-M    | Fixes the "page flash" on token expiry. Improves all pages.           |
| 11  | Year-over-year comparison | P3   | M      | Climate diary. Niche but deep engagement.                             |
| 12  | Weather camera            | P3   | L      | Fun feature for the hobbyist with a camera setup.                     |

---

## Things intentionally excluded

- **Multi-station fleet management** — the app already has multi-station support. This audit focuses on the single-station experience (the primary user).
- **Admin panel / user management** — out of scope for a personal hobbyist app.
- **External API integrations** (Weather Underground, OpenWeatherMap) — the station IS the data source.
- **Social features** (comments, likes, station following) — niche. Share link (#7) covers 80% of the social need.
- **Monetization** (paid tiers, limits) — premature. Build value first.
