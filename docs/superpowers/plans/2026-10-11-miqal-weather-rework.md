# Miqal Weather Station rework

Date: 11 October 2026

Status: Implemented and Vercel artifact verified; external provider smoke checks remain credential-dependent. See [verification](../../verification.md).

Make Weather Station a calm, dependable Miqal utility: check the selected station immediately, distinguish observations from forecasts, and explore measurements without losing context.

## Direction and scope

Use the October portfolio and current `@miqal/theme` foundation as the reference. The ecosystem now uses warm paper, warm charcoal, teal controls, Geist, Geist Mono, compact navigation, and deliberate interactions. The August blue/glow/dot-grid designs are superseded by `miqal-theme/docs/ecosystem-rollout-2026-10-03.md`.

Keep the existing `/miqal / meteo` header identity, `Weather Station` directory name, and `ms.miqal.xyz` address. Consistency comes from the foundation, language, and interaction quality; the weather workspace needs more width than the portfolio or sleep calculator.

Retain Svelte 5, SvelteKit 2, Tailwind 4, TanStack Svelte Query, and the Django API. Prioritize the existing single-station workflow while preserving station switching, EN/SK, both themes, credential/OAuth sign-in, and existing account and station capabilities.

The first release includes the app shell, overview, measurement history, station/account dialogs, an explicit sample experience, data reliability work, metadata, and verification. Separate presentation changes from transport/state changes so each increment can be reviewed and reversed independently.

## What the audit found

| Area          | Current evidence                                                                                                                                                                                       | Rework consequence                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation    | `src/app.css` already imports `core.css`; `src/app.html` already loads Geist/Geist Mono. Weather pins theme `0.2.0`; Portfolio and Subnify pin `0.2.1`.                                                | Finish the migration and pin the verified `0.2.1` release. Do not rebuild the palette or replace fonts.                                   |
| Landing       | Generic feature sections, nested sample cards, an always-mounted map, and repeated registration copy remain. Samples show a current-looking timestamp without a prominent sample label.                | Short factual introduction, one clearly labeled sample view, and direct Open overview / Try demo actions.                                 |
| Overview      | Unified dashboard exists, but has nested cards, repeated today/forecast information, a full map, hard-coded sensor/status colors, two large charts, and staggered entrance animation.                  | Recompose around current readings, a concise trend, and a readable forecast. Move location and management into secondary interactions.    |
| History       | `/measurements` is fixed to seven days, uses a much narrower layout, and opens daily detail in a large dialog.                                                                                         | Consistent workspace, shared date controls, useful day detail, and recoverable loading/error states.                                      |
| Data identity | `cachedStats` and `placeholderData` can retain a previous station/range; an empty response can fall back to old readings.                                                                              | Never display data for a different selection as current. Retain successful data only for the same exact request identity.                 |
| Data meaning  | Daily stats expose temperature and humidity, while the overview labels extrema across these values as Max/Min. Observed UV is accessed through `any` and is absent from the declared measurement type. | Verify the API contract; label daily averages honestly and show only supported observed fields. Forecast UV remains forecast information. |
| Wire data     | Measurement/stat timestamps are declared as Dayjs, but the Axios methods return raw JSON. Some views normalize them; the overview calls Dayjs methods directly.                                        | Define wire DTOs and a consistent parsing/formatting boundary, tested against real JSON-shaped fixtures.                                  |
| State/session | A shared rune object holds user/station state; the universal layout mutates a singleton Axios authorization header. The whole shell is keyed by `page.url`.                                            | Isolate request and app-instance state, stabilize query-cache ownership, and avoid remounting the shell on every URL change.              |
| Requests      | The navbar fetches each station's latest reading even though the current station list does not display those readings. Parallel requests still scale with station count.                               | Remove these unused requests. Opening a page should load the selected station, rather than every station's readings.                      |
| Maintenance   | `AGENTS.md`/README say SvelteKit 5 and no tests. Actual Kit is `2.22.3`; seven test files and 30 tests exist. Node 18 guidance conflicts with installed Vite 7 requirements.                           | Correct onboarding/runtime guidance and record a reproducible baseline before upgrading dependencies.                                     |

At planning time the backend location was unknown. The user subsequently identified the sibling `ms_api` repository. Its PostgreSQL-backed API contract tests now establish aggregation, access policy, pagination, and UTC date semantics; unsupported observed sensors are hidden. See [API contracts](../../api-contracts.md).

## Visual and interaction system

- Keep the shared warm canvas and light/dark semantic roles. Use `app-weather` sparingly for decorative product identity; use status tokens for status and chart tokens for data.
- Use sans-serif headings, navigation, and explanation. Reserve mono/tabular numerals for identity, timestamps, units, coordinates, and readings.
- Use a workspace around 70rem wide, aligned between header and content; use a narrower reading width for the landing introduction. Start content about 24–32px below the sticky header instead of the current large top gaps.
- Make one dominant temperature reading and a compact, labeled observation strip. Use whitespace and restrained section boundaries; avoid a card around every value and another card around each chart.
- Keep modest token-based radii and flat surfaces. Remove glass treatments, decorative shadows, and staggered content entrance animation. Essential information appears immediately.
- Main controls have 44px targets. Icon controls have translated accessible names; inputs have associated visible labels; selected navigation/theme/language states remain explicit.
- Preserve readable units, one page-level heading in every state, visible focus, reduced motion, keyboard access, and contained table overflow. Charts need labels and a textual/table alternative.

## Target screens

### Shared shell

The header contains `/miqal / meteo`, Overview, Measurements, language, theme, and account controls. Product navigation uses proportional text and one understated active treatment. Add a skip link and align the header to the workspace.

Move station selection into the workspace heading so it is close to the readings it changes. Reuse one station picker on Overview and Measurements. It exposes selection and a Manage stations action; authenticated users can add/edit through the same flow. Remove duplicate bottom-of-dashboard station controls and unnecessary success toasts for ordinary selection.

On mobile, keep identity and utility controls in a compact first row, with a simple labeled product-navigation row or disclosure. Avoid the current full-screen menu for two primary destinations. Keep account/dialog focus handling and selected states intact.

### Landing and sample experience

Keep `/` as a concise signed-out introduction. Preserve the authenticated entry to `/dash`, implemented as a temporary session-dependent redirect rather than a permanent cached redirect.

Suggested copy: **Weather at your station.** “Current readings, measurement history, and forecasts.” Show Open overview and Try demo, followed by one labeled sample preview and a small source link. Remove the feature grid and repeated registration pitch.

Add `/demo` as a read-only sample entry using the same weather components and deterministic fixtures. Show Sample data and Exit demo visibly. Do not simulate an authenticated user, write mock JWT cookies, or make backend calls. Preserve supported read access for signed-out visitors according to the real API's policy. Account creation remains available when needed to manage a station.

### Overview: `/dash`

The primary question is “What is happening at this station?” Render in this order:

```text
/miqal / meteo       Overview  Measurements       EN  Theme  Account

Station selector · City                   Last reading 3 min ago  Refresh

24.1 °C     Humidity 65%    Pressure 1013 hPa    Wind 5 m/s · S
             Additional supported readings, with explicit units/meaning

Recent measurements                        Forecast
[Today] [7 days] [30 days] [Custom]          Today · high / low · rain · wind
[Temperature] [Humidity]                   Next days as compact labeled rows
One labeled chart + truthful summary        Forecast update/source metadata

Explore measurements →                     Station details / Location
```

Use a two-column desktop composition with more space for the trend. Stack current observations, trend, and forecast on mobile. Keep location behind a disclosure/dialog; mount the map only when opened. Leaflet is already imported dynamically, but the current map still mounts eagerly in the dashboard and landing.

Default to Today for the immediate view, with an intraday series only after complete day-data retrieval is verified. Until then, ship a truthful daily-averages trend with seven days as its default. Do not draw a daily aggregate as if it were a continuous intraday trace.

Show one selectable Temperature/Humidity chart, with axes appropriate to the selected period and explicit °C/% units. Keep a concise observed-summary strip; do not claim raw extremes or total rainfall from unsupported daily fields. Empty and single-point periods have useful non-chart states.

Use “Last reading …” or “No readings received” rather than asserting a station is online from a timestamp alone. Age updates while the screen remains open. Add manual Refresh; configure focus/reconnect freshness separately from the age label. Automatic polling is optional only after the backend update cadence and request budget are confirmed. Keep valid cached data visible during a same-selection refetch, with its timestamp and a local failure message if refresh fails.

Forecast values are visibly separate from observations. Keep today and upcoming days in one forecast section with day drill-down for secondary fields. Model-run and retrieval times must be labeled according to their actual meanings. Forecast failure must not hide working observations/history.

### Measurements: `/measurements`

Use the same heading, station picker, width, date controls, and formatting rules as Overview. Make this the detailed history workspace rather than a second current-conditions dashboard.

Provide Today / 7 days / 30 days / Custom, with seven days as the initial history view. Present daily averages in a semantic table and a selectable metric chart. Selecting a day opens timestamped raw readings; an inline detail panel on desktop and a mobile sheet can share the same detail component. Keep pagination, day navigation, and chart/table choices where they improve exploration.

Put station, date range, metric, and selected day in validated URL parameters. Reload and Back/Forward restore the view; language switching retains those parameters. A link encodes the selection, not new permission to access a station.

CSV export belongs in the second increment after pagination is correct. Name the scope explicitly: either daily aggregates for the selected range or all raw measurements for one selected day. Never export only the visible page while describing it as a complete day/range.

### Stations, authentication, account, and errors

Use compact station rows with name, city, selected state, and a separate edit control. Keep create/edit focused on station configuration; remove duplicated weather dashboards from the management dialog after confirming equivalent access from Overview. Treat latitude/longitude zero as valid coordinates.

Bring sign-in/register/profile/deletion dialogs onto opaque theme surfaces with concise sans-serif titles, clear labels, inline feedback, and correct focus restoration. Preserve provider POST forms, callback ticket exchange, password-provider behavior, and destructive confirmations. Deletion copy names the affected station and date scope; successful deletion refreshes all affected views.

Every screen distinguishes loading, signed out, no selected station, no stations, API unavailable, station with no readings, empty selected period, stale cached data, and missing forecast. A failed request is never presented as an empty dataset. Retain a working recovery action and an `h1` even in empty/error states.

## Implementation sequence

### 0. Establish the baseline and API contracts

Primary files: `README.md`, `AGENTS.md`, `.env.example`, `package.json`, `vitest.config.ts`; backend contract notes under `docs/`.

- [x] Preserve the existing uncommitted UI/state/translation edits; review their intent before integrating overlapping work.
- [x] Document the actual stack and existing tests. Make test environment setup independent of an undocumented shell variable and of hard-coded host assumptions.
- [x] Agree on runtime/pnpm versions for local development, CI, and hosting. Node 24 is the audited local runtime; pin a compatible runtime instead of retaining the Node 18 claim. Vite 7 requires Node 20.19+ or 22.12+ ([official guide](https://v7.vite.dev/guide/)).
- [x] Verify real JSON payloads, public/owned station access, ordering, page-size limits, empty/404 behavior, daily aggregation, measurement frequency, rain accumulation/reset meaning, forecast date offsets, and supported date-boundary filters.
- [x] Define date semantics: Today is a calendar day; 7/30 days include today plus 6/29 prior days; custom dates include both selected calendar dates. Show the display timezone. Do not infer a station IANA timezone from the currently available fields. Verify DST and provider forecast dates separately.
- [ ] Archive a complete before/after screenshot and bundle comparison. Initial command/browser findings are recorded below; final screenshots, request budgets, and output sizes are in verification. A reliable archived bundle comparison was not retained.

Exit: reproducible frontend checks plus a small API capability matrix. If the backend is unavailable, proceed with shell/state work and defer only dependent features.

### 1. Complete the Miqal foundation and shell

Primary files: `package.json`, `pnpm-lock.yaml`, `src/app.css`, `src/app.html`, `src/routes/+layout.svelte`, `src/lib/components/ui/nav/*`, EN/SK menu translations.

- [x] Pin `@miqal/theme@0.2.1`; retain `core.css` and existing Geist loading. Use shared semantic roles rather than app-local palette overrides.
- [x] Implement the aligned shell, skip link, proportional navigation, quiet active states, compact mobile navigation, and common workspace heading/station picker.
- [x] Remove URL-keyed shell remounting after app-instance state is safe; preserve dialog/navigation behavior when URL filters change.
- [x] Consolidate Lucide onto one installed Svelte package by migrating imports; both current packages are used, so neither can simply be deleted. Remove unused GSAP and investigate the accidental `kit@latest` local-link dependency before a clean install.
- [x] Update other dependencies in separate compatible groups after peer/release review. Keep major migrations outside the redesign unless an identified support/security issue requires one; check current docs again when implementing.

Exit: landing, Overview, Measurements, and dialogs share the intended typography, colors, controls, and mobile shell.

### 2. Fix data/state ownership and refresh behavior

Primary files: `src/hooks.server.ts`, `src/routes/+layout.server.ts`, `src/routes/+layout.ts`, `src/lib/shared/api.ts`, `types.ts`, `runes.svelte.ts`, `src/lib/components/StateContext.svelte`; new app context and query/formatting modules.

- [x] Replace shared user/station rune state with app-instance context initialized from request data. Scope server API clients/authorization to each request. The current universal-load singleton mutation is a request-isolation risk; verify the correction with concurrent requests. This follows [SvelteKit's state guidance](https://svelte.dev/docs/kit/state-management).
- [x] Preserve a query client for an app/session in the browser and isolate it during SSR. Clear/cancel account-specific caches and transport authorization on logout/account change. Follow the installed-version-compatible [Svelte Query SSR guidance](https://github.com/TanStack/query/blob/main/docs/framework/svelte/ssr.md).
- [x] Create shared station/latest/stats/day/forecast query factories with primitive keys containing data mode, session scope, station, normalized dates, and pagination where relevant. Remove the divergent `weekStats`/`measurementStats` contracts.
- [x] Use JSON wire types with string timestamps and validated numeric/null fields. Normalize once for consumers; keep any server-load payloads serializable. Make mocks use the same wire contract as the real backend.
- [x] Remove free-floating `cachedStats`. Preserve data only for the exact same identity during refetch. Station/range changes show their own loading/empty/error state; successful empty data stays empty.
- [x] Stabilize selected range endpoints per user selection; do not generate a new “now” key on unrelated renders. Validate custom dates, invalid URL parameters, reversed ranges, and query limits.
- [x] Centralize mutation invalidation for station changes and measurement deletion, including daily detail, latest readings, and every affected aggregate range.
- [x] Remove unused per-station navbar reads and `invalidateAll()` from ordinary station selection. Query identity should drive the selected-station update.
- [x] Repair refresh control flow: the existing redirect sits inside a catch-all refresh block and can be caught as a refresh failure. Populate request locals after successful refresh, bound retry behavior, handle refresh-only sessions, and distinguish rejected credentials from temporary backend failure. Preserve cookie protections and OAuth ticket boundaries.

Exit: no cross-station/session/range data mixing; JSON-shaped data works; empty periods remain empty; refresh, station changes, logout, and deletion keep the UI consistent.

### 3. Rebuild the overview composition

Primary files: `src/routes/dash/+page.svelte`; new local weather sections; `src/lib/components/forecast/{card,table,dialog-card}.svelte`, `measurements/stats-chart.svelte`, station picker, EN/SK dashboard/forecast translations.

- [x] Extract current observations, trend, forecast, freshness, and location sections with explicit data/state props. Keep the route responsible for selection and orchestration.
- [x] Implement the proposed reading hierarchy, single metric chart, supported sensor strip, concise forecast, and secondary location access.
- [x] Replace missing observed UV, ambiguous Max/Min, generic online claims, and hard-coded status colors with supported data and precise labels.
- [x] Add local skeletons/retry states and manual refresh; remove page-blocking initial spinners and entrance delays.

Exit: the first viewport identifies station, current temperature, essential readings, and reading age. Every section can fail independently; all displayed values have a source and units.

### 4. Make history useful and consistent

Primary files: `src/routes/measurements/+page.svelte`, `src/lib/components/measurements/{stats-table,stats-chart,day-dialog,chart,table,delete-dialog}.svelte`, shared range/query modules, EN/SK measurements translations.

- [x] Add shared range controls and URL restoration, a proper page heading, consistent width, and clear daily-average labels.
- [x] Fix day-detail request gating, reset pagination when station/day changes, use stable date-string keys, and retrieve complete bounded day series before rendering a whole-day chart. Current charts request only one page of 24 readings.
- [x] Keep large daily datasets paginated in the table; distinguish a partial series if complete retrieval is unavailable. Provide chart summaries/table alternatives and handle gaps without implying continuous data.
- [x] Make keyboard selection, mobile detail, retries, loading, empty periods, and deletion consequences usable. Confirm inclusive calendar bounds against the backend's currently strict `timestamp__gt`/`timestamp__lt` filters; do not silently omit midnight readings.
- [x] Add clearly scoped CSV export only after the data-completeness and request-limit checks pass.

Exit: a user can open any supported period, inspect a day's readings, return to the same selection, and trust the scope of charts and exports.

### 5. Finish entry, management, and ecosystem handoff

Primary files: `src/routes/+page.svelte`, proposed `src/routes/demo/+page.svelte`, deterministic fixtures, station dialogs/list, auth/profile components, `src/routes/+error.svelte`, OAuth error screen, EN/SK translations, social/favicon assets.

- [x] Replace the remaining landing feature grid with the concise introduction/sample; implement the isolated read-only demo and remove the auth/profile mock-mode toggles.
- [x] Simplify station/account dialogs and unify unavailable/empty/recovery copy. Keep existing ownership/authorization behavior and explicit destructive confirmations.
- [x] Align localized titles and descriptions; update social imagery and product identity in metadata. Set document language correctly. Keep sample pages out of search indexing; apply indexing/canonical rules according to public versus private access.
- [x] Once the interface is verified, replace Portfolio's weather screenshot at `portfolio/public/projects/weather/measurements-preview.png` and adjust EN/SK preview captions if needed. Do not show mock activity as live weather. Keep the portfolio's existing app registry identity and links.
- [x] Update Weather's design/onboarding notes and the ecosystem verification record to describe the delivered state.

Exit: entry, sample, management, error, and portfolio-preview surfaces agree with the working app.

### 6. Verify and prepare release

Primary files: existing Vitest suites, focused domain/query/state and API tests, and `docs/verification.md`. Browser verification was performed interactively; a standalone browser suite was not added.

- [x] Unit/contract coverage: JSON parsing, nullable/missing sensors, daily-average labels, range/DST boundaries, freshness clock, exact cache identity, complete-day pagination, deletion invalidation, concurrent request isolation, and refresh success/failure. Keep existing cookie/OAuth tests.
- [ ] Browser coverage: two-station switching, empty custom range after a populated range, partial API failure, slow/stale responses, manual refresh, day navigation, Back/Forward, demo isolation, logout/account change, and existing auth form structure. Use deterministic fixtures and API interception locally.
- [x] Review light/dark and EN/SK at 320px, 390px, 768px, and desktop widths. Confirm no page overflow, usable table scrolling, visible focus, dialog return focus, accurate selected states, and accessible chart alternatives.
- [x] Run `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, interactive browser checks, and `git diff --check`. Review dependency advisories and apply compatible updates. Final audit reports zero advisories.
- [ ] Compare route request counts and bundle sizes to Phase 0. Confirm hidden maps do not initialize/download tiles, the homepage does not query stations unnecessarily, and forms do not pull unused server adapters into browser code. Investigate the existing `node:dns/promises` browser-externalization build warning.
- [x] Configure the explicit Vercel adapter with Node 24 and verify the generated function through HTTP requests. Production API origin validation and deployment configuration are documented.
- [ ] Perform authenticated and live-API smoke checks against an agreed test station before release, including OAuth, refresh, station mutations, and timestamp semantics. Prepare the verified changes and release notes for a separate deployment decision.

Exit: frontend checks and visual review pass, capability-dependent claims have backend evidence, and the release has a recorded rollback path.

### Local delivery note

Phases 0–5 are implemented apart from the archived baseline comparison. Phase 6 has automated and interactive verification, including authenticated local API mutations and a generated Vercel function HTTP smoke test. External provider verification remains credential-dependent. Backend Poetry/PostgreSQL setup was repaired using Python 3.12. See the verification record for exact coverage, warnings, and remaining boundaries.

## Delivery priority and effort

Deliver in independent increments: foundation/state correctness → Overview → history → entry/dialogs/preview → release verification. Phase 0 precedes all of them. Phase 2 precedes replacing cache/selection behavior in the new screens. Stage dependency maintenance separately so failures can be attributed and reverted.

Allow roughly **10–15 focused working days** for the frontend rework and verification, assuming access to a test API and no backend schema work. This is a planning estimate, not a delivery commitment. Complete intraday data, new sensor aggregates, public sharing, or authentication transport changes can expand it; re-estimate those after the capability matrix.

Defer threshold alerts, notifications, public share links, PWA/offline behavior, year comparisons, cameras, AI summaries, a framework rewrite, ecosystem SSO, and a shared runtime component package. Add wind/pressure/rain history only when the backend provides verified aggregation and units; current daily stats do not establish that capability.

## Audit baseline recorded on 11 October

- Local runtime: Node `24.21.0`, pnpm `10.8.0`.
- `pnpm lint`: passes.
- `PUBLIC_API_URL=http://127.0.0.1:8000 pnpm check`: passes, zero errors/warnings.
- `PUBLIC_API_URL=http://localhost:8000 pnpm test`: passes, 7 files / 30 tests. Without the environment value, env imports and auth rendering fail; with `127.0.0.1`, three tests fail because their assertions hard-code `localhost`. Make this configuration explicit in Phase 0.
- `PUBLIC_API_URL=http://127.0.0.1:8000 pnpm build`: passes. Existing browser-externalization and production-adapter warnings remain.
- Browser review: signed-out landing, sign-in dialog, and no-station Overview using a local frontend. Live backend, authenticated mutations, and OAuth providers were not exercised.
- Graft freshness: all six indexed ecosystem repositories report in sync. Source inspection was used for Svelte views and state files where symbol tracing was unavailable.
- Existing uncommitted source changes were left intact. This planning pass adds this document only.
