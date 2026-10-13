# Weather Station verification · 2026-10-13

The Miqal rework and Vercel deployment configuration are implemented and checked.
Existing uncommitted UI/state/translation work was integrated; the original
patch is saved locally at `/tmp/ms-web-before-rework.patch`.

## Live API recheck

Reproduced **Stations could not be loaded** in the browser. No Django process
was initially listening on port 8000. Another project's Vite server occupied
5173, so Weather Station silently moved to 5174. After starting Django, station
JSON returned 200 but lacked the CORS header for the actual frontend origin.

`pnpm dev` now starts/checks the local sibling Django API, configures its
CORS/OAuth origin for `http://localhost:5174`, and verifies a station request with
that Origin header before opening Vite. Vite uses port 5174 with strictPort.
Verified startup with no API, rejection of an existing mismatched API, and a
clear error for a second frontend process on an occupied port. The other project
on 5173 was left running. Supervisor shutdown stopped both owned servers;
restarting `pnpm dev` restored the API and frontend successfully.

The explicit `seed_weather` command added **two labeled Local test stations and
2,856 synthetic observations** to the local PostgreSQL database: 30 UTC dates per
station, 48 readings for each past day, and only elapsed timestamps today. The
fixture owner has an unusable password. No fake forecasts were inserted.

`verify_weather_api` exercises actual HTTP requests against the running API:

- Public station lists, latest reading identity, CORS and authorization preflight.
- Thirty daily averages per station, compared numerically with PostgreSQL.
- Complete 48-reading past days across two API pages, and empty ranges.
- JWT current-user/owned-station reads, station create/edit/delete, individual
  and bulk measurement writes, aggregate refresh, and scoped deletion.
- Foreign station mutations and mixed-owner bulk uploads rejected without
  partial writes. Temporary test stations/accounts removed after verification.

This exposed stale past-day averages after measurement writes. Create, edit,
delete and bulk operations now invalidate the affected derived statistics. Bulk
uploads now receive serializer request context so ownership validation runs.
Invalid station identifiers return 400 rather than an unhandled server error.

Browser verification used `/dash` and `/measurements` with this real API:

- Both stations load/switch correctly. Today humidity, seven/thirty-day ranges,
  UTC day detail, both detail pages through 23:30, and Escape focus restoration.
- Downloaded CSV: 30 rows, 2026-09-14 through 2026-10-13 inclusive, correct units.
- Empty custom dates clear populated history and disable export.
- Rapid station/range/metric changes preserve all selections in the URL. Fixed
  overlapping navigation that previously dropped the first selection.
- A disposable local account signed in through the real form, created/edited a
  zero-coordinate station, displayed HTTP-created readings, deleted Today only,
  deleted its test station, and signed out. The account was then removed.
- Actual pointer hover inspected for outlined, primary button/anchor, destructive,
  and disabled controls. Primary hover retains readable foreground colors in
  light/dark. Keyboard focus is visible. Range presets have hover feedback.
- Live overview/history checked at 320, 390, 768 and default desktop widths.
  No document overflow; English/Slovak and light/dark/system preferences work.
  Temporary viewport, language and theme changes were restored.

Local Meteoblue is unconfigured and returns 503; the forecast error stays separate
from successful station observations/history. External Meteoblue and OAuth
provider calls still require credentials and are not claimed as verified.

Latest proof: [live PostgreSQL overview](verification/live-overview-2026-10-13.png).

## Delivered

- `@miqal/theme@0.2.1`, Geist, warm paper/charcoal surfaces, teal controls,
  aligned navigation, responsive workspaces, and English/Slovak copy.
- Overview with supported temperature/humidity observations, reading age,
  selectable trends, independent forecast recovery, and a lazy location map.
- UTC history with Today / 7 / 30 / custom dates, URL restoration, bounded complete
  day retrieval, paginated detail, and complete daily-average CSV exports.
- App/request-owned state and transport authorization, scoped query identities,
  session cache clearing, mutation invalidation, and corrected JWT refresh flow.
- Explicit read-only `/demo` routes. Samples never replace failed live requests.
- Focus restoration, opaque dialogs, ownership checks, provider POST forms,
  account error feedback, metadata, SVG favicon, and refreshed portfolio imagery.

## Automated checks

| Check                               | Result                                  |
| ----------------------------------- | --------------------------------------- |
| `pnpm check`                        | 0 errors / 0 warnings                   |
| `pnpm test`                         | 89 tests / 15 files pass                |
| `pnpm lint`                         | Pass                                    |
| `pnpm build:vercel`                 | Pass; Node 24 Vercel artifact generated |
| `pnpm audit`                        | 0 advisories                            |
| `git diff --check`                  | Pass for app, API, and portfolio edits  |
| `poetry install`                    | Pass using Python 3.12.15               |
| `poetry run python manage.py check` | No issues                               |
| `poetry run python manage.py test`  | 75 tests pass using PostgreSQL 18.6     |
| `verify_weather_api`                | Real HTTP reads, JWT and mutations pass |

Dependency updates retain SvelteKit 2, Svelte 5 and Vite 7. The Svelte Query adapter
uses version 6 with Svelte 5 accessors and query-core 5. Formatting was verified with the installed Prettier 3.6.2 and the current
Svelte/Tailwind formatter plugins. Forms use matching Zod 4 / Superforms adapters. The narrowly scoped
`@sveltejs/kit>cookie` override selects 0.7.2 to resolve its remaining advisory.

The build still emits the existing `node:dns/promises` externalization warning
while resolving Superforms' unused Vine adapter. The application uses Zod;
Vine validation is not called. Dependency tracing also reports the optional
`debug` dependency `supports-color`; its absence does not prevent the generated
function from starting or serving the checked routes.

## Vercel artifact verification

Replaced adapter-auto with the explicit SvelteKit 2-compatible Vercel adapter.
The generated function declares `nodejs24.x`, region `fra1`, response streaming
and SvelteKit 2.70.3. Its bundled handler was started behind a temporary Node HTTP
server: `/`, `/demo`, `/demo/measurements`, `/dash`, `/measurements` and
`/oauth/error` all returned HTML with status 200.

The frozen pnpm install used by Vercel succeeds. Production API resolution
defaults to `https://meteostanica.fly.dev` and validates an optional override as an
HTTPS origin. A localhost override is rejected before the build. Tests cover the
development/production defaults, valid overrides and malformed/loopback URLs.
The Fly station endpoint returned 200 with CORS headers allowing
`https://ms.miqal.xyz` and `https://meteo.miqal.xyz`. No production data was changed.
See [deployment configuration](vercel-deployment.md).

The first production smoke test also exposed `derived_inert` warnings after
navigating between workspaces. Svelte Query 5 retained an options-store
subscription after its component was destroyed. Migrated the three query consumers
to Svelte Query 6's native rune accessors, whose subscriptions have component
cleanup, while preserving the existing query identities and API contracts. A
mounted lifecycle regression checks that destroyed views have no observers,
produce no inert-derived warnings on station changes, and load fresh data when remounted.

The Vercel Git integration successfully published the redesign at
https://ms.miqal.xyz. Browser checks against Fly loaded both public stations,
switched stations, displayed live Meteoblue forecasts, and loaded station One's
7 April 2025 daily average and all 22 raw readings. The exported CSV contains
that UTC date and the matching temperature/humidity means. Current history is
correctly empty: the latest reading for station One is from that date, and station
Two has no observations. No production observations or accounts were added.

The API changes were pushed separately. Its GitHub Fly Deploy workflow is
`disabled_manually`, so pushing does not deploy the backend changes. Local API
mutations/fixtures and tests verify those changes; production writes remain
outside the smoke check above.

## Earlier demo checks · 2026-10-11

Verified against the local app and deterministic sample data:

- Two-station switching changes observations, chart, history, and URL together.
- Seven/thirty-day history, Today humidity, selected-day URLs, Back navigation,
  empty custom ranges after populated ranges, and disabled empty exports.
- Day detail has all 48 sample readings; its two table pages reach 23:30 UTC.
  Escape closes the dialog and returns focus to the selected day control.
- The downloaded 30-day CSV contains 30 data rows, explicit daily-mean units,
  and both inclusive endpoints.
- Forecast day navigation, °C/mm/m/s units, separate model-run/retrieval labels,
  map disclosure, and visible OpenStreetMap attribution.
- Light/dark themes and EN/SK. No document overflow at checked widths of
  320, 390, 768, and 1280 pixels. Tables scroll within their own container.
- Signed-out landing, live empty-station state, sign-in/provider form structure,
  API-unavailable error, and successful retry after restarting the local API.

Browser checks were performed interactively; no standalone Playwright suite was
added. Token isolation, refresh outcomes, account action failures, ownership,
pagination, and provider outages have automated coverage with mocked transport
or Django's disposable PostgreSQL test database.

The overview screenshot is `static/weather-preview.png`; the history screenshot
is `../portfolio/public/projects/weather/measurements-preview.png`. Both clearly
show sample data. The portfolio captions describe the seven-day sample history.

## Requests, runtime, and release boundaries

The landing and demo make no weather API requests. A seven-day overview uses one
station-list query and reads only the selected station's latest, stats, and
forecast. History does not request forecasts or latest observations. Station
pagination, larger date ranges, raw-day pages, and the single retry can add
requests. Hidden maps do not mount Leaflet or fetch map tiles.

The local production output's largest JavaScript chunks are approximately
337 kB / 116 kB gzip, 302 kB / 91 kB gzip, and 183 kB / 55 kB gzip; lazy Leaflet
is approximately 150 kB / 43 kB gzip. No reliable archived baseline size comparison
is available; the bundle still has room for a separate loading/performance pass.

Poetry initially selected Python 3.15 and attempted unsupported native builds
of locked psycopg2-binary/rpds-py. Python 3.12 was installed and selected for
`ms_api`; its tightened declared interpreter range prevents silently choosing
3.15 again and matches the existing `.python-version`. PostgreSQL was already installed/running. The local
`ms_api` database and ignored `.env` were created and migrations applied.

Real Meteoblue and Google/GitHub OAuth requests require provider credentials.
Those external provider flows still need credential-dependent smoke tests.
The Vercel artifact/runtime was checked as described above; publishing is tracked
by the repository's Vercel Git integration. Local authenticated UI mutations and seeded API reads
were verified in the October 13 recheck above. The two labeled local fixture
stations remain available for further verification.
