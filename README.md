# Weather Station · Miqal

A SvelteKit 2 / Svelte 5 workspace for station observations, measurement history,
and meteoblue forecasts. Uses the paper/teal surfaces and Geist typography from
`@miqal/theme@0.2.1`, with English and Slovak translations and light/dark/system themes.

## Run locally

Use Node 24 and pnpm 10.8.0. The API is in the sibling `../ms_api` repository.

```bash
pnpm install
cp .env.example .env
pnpm dev                 # http://localhost:5174; starts the local Django API too
```

In development, `PUBLIC_API_URL` defaults to `http://localhost:8000` and can be overridden at runtime.
First follow `../ms_api/README.md` for Python 3.12, Poetry, PostgreSQL and migrations.
For a local API, `pnpm dev` starts Django from `../ms_api`, aligns its CORS/OAuth
origin with `http://localhost:5174`, and verifies a browser-origin station request
before starting Vite. Stopping the command stops the API it started. An API
already running is reused only when that origin check passes; a mismatch reports
how to restart it. `MS_API_DIR` can override the sibling repository path.

Port 5174 is fixed: Vite fails clearly if it is occupied instead of silently
switching to an origin the API rejects. Use **localhost** in the browser.
`pnpm dev:frontend` starts only Vite, for an independently managed API; configure
that API's CORS/OAuth origin for port 5174. A remote `PUBLIC_API_URL` also leaves
API startup to its owner.

To verify real PostgreSQL data rather than the frontend demo, explicitly seed
local test observations once, then run the HTTP check while `pnpm dev` is running:

```bash
cd ../ms_api
poetry run python manage.py seed_weather
poetry run python manage.py verify_weather_api
```

The seed creates two **Local test** stations with 30 UTC days of synthetic
readings, under a dedicated account with no usable password. Existing data is
preserved. These commands require DEBUG and a local database. The HTTP check
compares pagination and daily means with PostgreSQL and exercises JWT mutations
on a temporary station that it removes afterwards. The seed supplies no fake
provider forecasts; meteoblue still requires its API key.

`/demo` and `/demo/measurements` work without the API or an account. Their
calendar-relative deterministic fixtures cover the last 30 UTC days and are
read-only. Sample data never substitutes for a failed live request. `/dash` and
`/measurements` show public stations when signed out and owned stations when signed in.

## Data and behavior

- Observations are temperature (°C) and humidity (%), with a timestamp and reading age.
- History uses inclusive UTC calendar dates. The URL restores station, range,
  metric, and selected day through reload and Back/Forward.
- Today charts raw readings; other ranges chart daily averages. A past day needs
  at least two readings to appear in the backend's aggregate response.
- Week-sized requests compose 30-day/custom ranges. Custom ranges are bounded
  to 366 days; full-day retrieval is bounded to 50 pages of 30 readings.
- CSV exports **all daily averages** for the selected station/date range; incomplete
  or failed requests never produce a partial export.
- Forecast dates retain the provider's calendar dates. Model run and retrieval
  timestamps are labeled separately. Forecast failure does not hide measurements.
- Maps load Leaflet only when opened and retain OpenStreetMap attribution.
- App state and API authorization are scoped to the mounted app/request. Query
  identity includes session, data mode, station, and date bounds.

See [API contracts](docs/api-contracts.md) and [verification](docs/verification.md).

## Checks

```bash
pnpm check
pnpm test
pnpm lint
pnpm build
```

Vitest supplies an isolated API URL and mocks network calls; no shell environment
variable or running API is needed. Tests cover JSON/date validation, complete-day
pagination, session/query isolation, invalidation, refresh recovery, cookies, and OAuth.

Production uses the explicit Vercel adapter with Node 24 in Frankfurt. The default
API is `https://meteostanica.fly.dev`; an optional `PUBLIC_API_URL` override must
be an HTTPS origin. `pnpm build:vercel` validates it before generating the Vercel
artifact. See [Vercel deployment](docs/vercel-deployment.md) for configuration and checks.
