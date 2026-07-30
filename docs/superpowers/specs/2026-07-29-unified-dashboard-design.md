# Unified Personal Dashboard

**Date:** 2026-07-29
**Status:** Design approved — awaiting implementation

## Goal

Replace the `/dash` station-grid page with a personal weather dashboard for the selected station. The station grid moves to a secondary dialog.

## Current state

`/dash` shows a grid of station cards with per-card map thumbnails, temperature, humidity. It fetches ALL stations' latest measurements sequentially (N+1). For a personal weather hobbyist with one station, this page is mostly dead space.

`/measurements` shows the last 7 days — useful for hourly detail, but has a hardcoded window. No way to check last month, last summer, or pick a custom range.

## Target state

`/dash` shows ONE station's complete weather at a glance:

- Current conditions (big temp, humidity, pressure, wind, rain, UV)
- **Recent measurements** with date range selector (1d, 7d, 30d, custom) — summary stats + trend chart
- Today's forecast card
- Station location map
- 7-day forecast table

Station management (view all, create, edit) moves to a dialog behind "View All Stations" and "+" buttons at the bottom of the page.

## Layout

```
┌─────────────────────────────────────────────────────┐
│  Station Name — City            ● Online · 3m ago   │
│─────────────────────────────────────────────────────│
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │ Current Conditions│  │  Recent Measurements      │ │
│  │  22°C             │  │  [1d] [7d] [30d] [Custom]│ │
│  │  💧 65%  ⬇ 1013  │  │  Max: 28° Min: 15°       │ │
│  │  💨 5 m/s  🌧 0  │  │  Rain: 12mm  Wind: 25 km/h│ │
│  │  ☀ UV 5           │  │  ┌──trend chart (350px)──┐│ │
│  └──────────────────┘  │  │  temp + humidity lines  ││ │
│                         │  └────────────────────────┘│ │
│                         └──────────────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │ Forecast · Today  │  │  Station Location        │ │
│  │ (ForecastCard)    │  │  (Map preview, 200px)    │ │
│  └──────────────────┘  └──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │  7-Day Forecast Table (ForecastTable)            ││
│  └──────────────────────────────────────────────────┘│
│  [+ Add Station] [View All Stations]                │
└─────────────────────────────────────────────────────┘
```

Mobile: single-column stack, same order. Charts reduce to 200px height. Forecast table gets `overflow-x-auto`.

## Data flow

All data comes from existing TanStack Query queries — zero new API calls:

| Widget                         | Query                                      | Cache key                                          |
| ------------------------------ | ------------------------------------------ | -------------------------------------------------- |
| Station header + online status | `latestMeasurementQuery` + `stationsQuery` | `['latestMeasurement', stationId]`, `['stations']` |
| Current Conditions             | `latestMeasurementQuery`                   | `['latestMeasurement', stationId]`                 |
| Recent Measurements            | `measurementStatsQuery`                    | `['measurementStats', stationId, from, to]`        |
| Today's Forecast               | `forecastQuery` → `results[0]`             | `['forecast', stationId]`                          |
| Station Map                    | `stationsQuery` → station lat/lng          | `['stations']`                                     |
| 7-Day Forecast Table           | `forecastQuery` → all `results`            | `['forecast', stationId]`                          |
| View All Stations dialog       | `stationsQuery`                            | `['stations']`                                     |

Queries share cache with `/measurements` and `/forecast` pages. Navigate between pages and data is already loaded.

### Date range selector

The Recent Measurements widget includes a row of preset buttons above the summary stats:

| Button | Range                 | Query params                                                    |
| ------ | --------------------- | --------------------------------------------------------------- |
| 1d     | Today (00:00 to now)  | `from = dayjs().startOf('day')`, `to = now`                     |
| 7d     | Last 7 days (default) | `from = dayjs().subtract(7, 'day').startOf('day')`, `to = now`  |
| 30d    | Last 30 days          | `from = dayjs().subtract(30, 'day').startOf('day')`, `to = now` |
| Custom | User picks from/to    | Two `FormPicker` inputs, opens inline                           |

Presets are styled as `Button` variant `ghost` with the active one in `secondary`. The custom option reveals two date pickers inline (no dialog) using the existing `FormPicker` component. Clicking a preset immediately sets the range and refetches via TanStack Query (cache key includes `from`/`to`).

### Summary stats (derived from `measurementStatsQuery` data)

Shown as 4 stat pills in a 2x2 grid above the chart:

| Stat       | Source                               | Format    |
| ---------- | ------------------------------------ | --------- |
| Max temp   | `max` of all daily `temperature_max` | `28°C`    |
| Min temp   | `min` of all daily `temperature_min` | `15°C`    |
| Total rain | `sum` of all daily `rain`            | `12 mm`   |
| Max wind   | `max` of all daily `wind_speed`      | `25 km/h` |

Computed client-side from the query response with `$derived`. The chart shows daily mean temperature + mean humidity as two splines (twin-axis).

### API dependency

The `measurementStatsQuery` calls `api.getMeasurementStats(stationId, from, to)` — the same endpoint used by the existing `/measurements` page, which already supports `timestamp__gt` and `timestamp__lt` filters. No backend changes needed. The existing `weekStatsQuery` on `/measurements` uses the same endpoint with a 7-day window. The dashboard adds flexible `from`/`to` parameters.

### Reactivity

- `globalState.stationId` changes → all `stationId`-keyed queries auto-refetch
- Station selector in nav triggers `setSelectedStation()` → updates `stationId` → dashboard re-renders
- No polling. `staleTime: 60_000` on latest measurement for gentle refresh.

## Component reuse

| Component               | Source                            | Widget                     |
| ----------------------- | --------------------------------- | -------------------------- |
| `ForecastCard`          | `forecast/card.svelte`            | Today's Forecast           |
| `ForecastTable`         | `forecast/table.svelte`           | 7-Day Forecast Table       |
| `Map`                   | `ui/map`                          | Station Location           |
| `StatsChart`            | `measurements/stats-chart.svelte` | Recent Measurements chart  |
| `FormPicker`            | `ui/calendar/form-picker.svelte`  | Custom date range pickers  |
| `StationDialog`         | `station/station-dialog.svelte`   | Create/Edit station        |
| `Skeleton`              | `ui/skeleton`                     | All loading states         |
| Station card `#snippet` | current `dash/+page.svelte`       | "View All Stations" dialog |

Two new inline widgets:

- **Current Conditions** — large temp number + 2x3 stat pill grid. ~40 lines.
- **Recent Measurements** — date presets + summary stats + trend chart. ~80 lines (includes range selector, stat pills, chart, custom date inputs).

## States per widget

Every widget handles its own loading, empty, and error states independently. Failures don't cascade.

### No station selected (first visit)

- Full-page prompt: welcome message + "Create Your First Station" button
- If unauthenticated: "Please log in to create a station" with auth button

### Station selected, no measurements yet

- Current Conditions: "Waiting for first measurement" with station icon
- Recent Measurements: "No data yet" with station icon. Chart area hidden.
- Forecast: Works independently (no measurements needed)
- Map: Always works (station has lat/lng from creation)

### Date range returns empty

- Recent Measurements: "No data for this period" text. Summary stats show "—". Chart hidden.
- User can switch to a different range via the preset buttons.

### Partial API failure

- Each widget shows its own `[Retry]` button
- Working widgets render normally alongside failed ones
- `queryClient.refetchQueries({ queryKey })` on retry click

### Loading (any query pending)

- Each widget skeletonizes independently
- Progressive reveal: widgets appear as their query resolves
- Skeleton shapes: temp bar + stat pill placeholders, chart card placeholder, map placeholder, 4-row table placeholder

### Stale data (station offline)

Online status dot uses a progressive spectrum:

| Age            | Dot           | Text               |
| -------------- | ------------- | ------------------ |
| < 5 min        | Green pulsing | "Updated just now" |
| 5–30 min       | Green         | "Updated 15m ago"  |
| 30 min–2 hours | Yellow        | "Updated 1h ago"   |
| 2–24 hours     | Orange        | "Last seen 5h ago" |
| > 24 hours     | Red           | "Last seen 2d ago" |
| Never          | Gray          | "No data received" |

Derived from `dayjs().diff(latestMeasurement.timestamp, 'minute')`.

## Files changed

| File                               | Change                                                           |
| ---------------------------------- | ---------------------------------------------------------------- |
| `src/routes/dash/+page.svelte`     | Rewrite: replace station grid with dashboard layout (~250 lines) |
| `src/routes/forecast/+page.svelte` | Remove map preview (redundant with dashboard map, ~8 lines)      |

No new files. No other routes changed. No backend changes.

## What's NOT built (deferred to P1+)

- Wind/pressure/rainfall charts (temp + humidity only)
- Data export CSV
- Email alerts
- PWA support
- Public share links
