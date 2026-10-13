# Vercel deployment

The existing production site is https://ms.miqal.xyz. Deploy `ms_web` as a
SvelteKit project from the repository root. `vercel.json` specifies the frozen
pnpm install and `pnpm build:vercel`; `svelte.config.js` generates Vercel Build
Output API files for Node 24 in Frankfurt (`fra1`). Node and pnpm versions are
pinned in `package.json` and `.nvmrc`. Build artifacts and local environment files
are ignored by Git.

## API configuration

The production API defaults to https://meteostanica.fly.dev, the Fly app declared
in the sibling `ms_api/fly.toml`. `PUBLIC_API_URL` is optional; set it only to
override that origin. Use HTTPS without a path, query, credentials or trailing
API endpoint. Production rejects localhost and other loopback origins. This
check runs at build time and again when the app resolves its runtime environment.

The development `.env.example` points to localhost. If copied to `.env`, override
it when checking a production build locally:

```bash
PUBLIC_API_URL=https://meteostanica.fly.dev pnpm build:vercel
```

No database or provider secrets belong in Vercel's public variables. Django and
PostgreSQL remain separately hosted. Configure Meteoblue and Google/GitHub
credentials in the backend environment; observations do not require those keys.

The backend must allow the exact frontend origin through CORS. Production
requests from https://ms.miqal.xyz were verified against Fly. For OAuth, configure
the backend's `OAUTH_FRONTEND_ORIGIN`, callback and error URLs for the chosen
frontend domain, and register the backend callback URLs with each provider as
described in `ms_api/README.md`. A Vercel preview URL needs its own allowed origin
to access live data; `/demo` works independently of the API.

## Verification

```bash
HUSKY=0 pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm lint
pnpm build:vercel
```

The build creates `.vercel/output/config.json`, static assets and the server
function with `runtime: nodejs24.x` and `regions: [fra1]`. After deployment, verify
the landing page, `/demo`, `/dash` station loading and history. Provider sign-in
and forecasts require working backend credentials.
