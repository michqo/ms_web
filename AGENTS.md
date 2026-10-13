# AGENTS.md

<!-- context7 -->

Use Context7 for current library, framework, SDK, API, CLI, and cloud-service
documentation. Resolve the library ID before querying. Skip it for refactoring,
business-logic debugging, code review, and general programming unless product
documentation is needed.

<!-- context7 -->

## Commands and runtime

Use Node 24 and pnpm 10.8.0. `pnpm dev`, `build`, `check`, `test`, `lint`, and
`format` are the standard commands. `build:vercel` validates the production API
origin and builds the explicit Node 24 Vercel adapter. Husky runs lint-staged/Prettier before commits.
Tests are in `src/**/*.test.ts`; they do not require a live API or env variable.
`pnpm dev` starts/checks the sibling local Django API and aligns its CORS/OAuth
origin with the fixed frontend port 5174. `dev:frontend` runs Vite alone. Keep
strictPort enabled so a port collision cannot silently break CORS.

## Architecture

SvelteKit 2 / Svelte 5 / Vite 7, Tailwind 4, `@miqal/theme@0.2.1`, TanStack Query,
LayerChart, Axios, and sveltekit-i18n. The Django API is the sibling `../ms_api`.
Forms use Zod 4 with Superforms' `zod4` / `zod4Client` adapters. Keep the app and
adapter on the same Zod version; import browser form helpers from `/client`.
`@/*` resolves to `src/lib/*`. TypeScript is strict; format with tabs, single quotes,
no trailing commas, and 100 print width.

- `hooks.server.ts` validates cookies using explicit-token authentication calls.
  Refresh results populate the current request. Network failures preserve cookies.
- `+layout.server.ts` returns request locals, translations, form defaults, and the
  preferred station cookie. Universal layout load only initializes translations.
- `+layout.svelte` creates one QueryClient per app instance. `StateContext.svelte`
  supplies a context-owned rune object and WeatherApi instance. Never introduce
  a shared mutable server user state or mutate a singleton authorization header.
- Components read `getGlobalState()` / `getApi()` during initialization. Shared query
  factories are in `shared/queries.ts`; pass reactive options via `toStore` to the
  installed TanStack Svelte Query API. Keep query keys primitive and scoped.
- `/dash`, `/measurements`, `/demo`, and `/demo/measurements` share WeatherWorkspace.
  Overview sections and history/detail controls live under `components/weather`.
- Reads normalize JSON at the API boundary. Dates/times for measurement history are
  UTC. Forecast days are provider calendar dates. See `docs/api-contracts.md`.
- Demo is explicit, deterministic, and read-only; never enable mock auth/mutations
  or quietly replace a live API error with samples.
- Mutations invalidate the whole current weather query scope. Station selection
  changes the URL/query identity rather than calling invalidateAll.
- Authentication still uses secure JWT cookies, provider POST forms, and one-time
  OAuth callback ticket exchange. Account mutations require the request's token.
- `PUBLIC_API_URL` uses dynamic public env. Development defaults to localhost:8000;
  production defaults to https://meteostanica.fly.dev and rejects non-HTTPS/loopback origins.
- English/Slovak UI uses `weather.*` plus retained auth/menu/forecast keys. Locale
  changes keep URL state. Add matching keys in both languages.
- Theme core owns fonts, colors, focus, and radii. App CSS owns composition and
  spacing. Keep main controls at least 44px and maps behind a disclosure.

## Verification

Run the standard checks after relevant changes. Browser verification uses the
explicit demo routes and labeled real PostgreSQL fixtures from `seed_weather`.
Run `verify_weather_api` against the live local API as well as `../ms_api/tests`. Keep
empty/error states distinct and never describe a partial day/range as complete.
