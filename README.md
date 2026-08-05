<div align="center">
  <img src="static/favicon.png" width="64" />
  <h3>meteostation</h3>
  <p>personal weather station dashboard</p>
</div>

---

## about

monitor your backyard weather station in real time. built with SvelteKit and Django.

- **live dashboard** — current conditions, trends, and forecast at a glance
- **date range picker** — explore any period: 1d, 7d, 30d, or custom
- **oauth** — sign in with Google or GitHub
- **i18n** — English and Slovak
- **stations** — manage multiple stations, switch from the navbar

## stack

| layer    | tech                                         |
| -------- | -------------------------------------------- |
| frontend | SvelteKit 5, Tailwind CSS v4, TanStack Query |
| backend  | Django, DRF, Djoser, SimpleJWT               |
| auth     | JWT + OAuth2 (Google, GitHub)                |
| charts   | LayerChart, d3-scales                        |
| db       | PostgreSQL                                   |

## run locally

```bash
# frontend
pnpm install
pnpm dev          # → http://localhost:5173

# backend (in ms_api/)
poetry install
python manage.py migrate
python manage.py runserver  # → http://localhost:8000
```

env for frontend:

```
PUBLIC_API_URL=http://localhost:8000
```

env for backend (`ms_api/.env`):

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
OAUTH_FRONTEND_CALLBACK=http://localhost:5173/oauth/callback
```

env for backend (`ms_api/.env`):
