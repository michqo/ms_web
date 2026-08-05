# OAuth Authentication — Frontend

**Date:** 2026-08-05 (revised)
**Repo:** ms_web (SvelteKit frontend)
**Status:** Implementation in progress (branch `codex/oauth-integration`)

## Goal

Add OAuth2 social login buttons (Google, GitHub) to the existing username/password auth UI. Handle the OAuth callback by reading a one-time ticket from URL parameters, exchanging it server-side for JWT tokens, and setting httpOnly cookies.

**Backend counterpart:** `ms_api/docs/superpowers/specs/2026-08-04-oauth-integration.md`

---

## Architecture (Ticket Exchange Pattern)

```
User clicks "Continue with Google" in AuthCard
        │  POST form → <API_URL>/auth/social/login/google-oauth2/
        ▼
Backend returns 302 redirect to Google OAuth
        │
        ▼
Google OAuth — user authorizes
        │  Redirect back to backend
        ▼
Backend: GET /auth/social/complete/google-oauth2/?code=xxx&state=yyy
        │  Validates → creates/finds User → generates one-time ticket → redirects
        ▼
Browser: /oauth/callback?code=<ticket>
        │  +page.server.ts reads ticket, calls:
        │  POST <API_URL>/auth/social/token/ { code: "<ticket>" }
        │  → receives { access, refresh }
        ▼
Cookies set → redirect to /dash → authenticated
```

**Contract with backend:**

| Step            | Frontend sends                        | Backend returns       |
| --------------- | ------------------------------------- | --------------------- |
| Initiate OAuth  | `POST /auth/social/login/<provider>/` | 302 to provider       |
| Exchange ticket | `POST /auth/social/token/ { code }`   | `{ access, refresh }` |

---

## What's Implemented

### 1. OAuthButtons component (`src/lib/components/ui/OAuthButtons.svelte`)

Google and GitHub buttons as POST forms. Each button:

- Uses `buildOAuthActionUrls(PUBLIC_API_URL)` to construct backend URLs
- Disables all buttons while submitting (prevents double-click)
- Re-enables on `pageshow` (handles browser back-button after OAuth redirect)
- Hidden in mock mode

```svelte
<form method="POST" action={actionUrls.google} onsubmit={startSubmission}>
	<Button type="submit" variant="outline" class="w-full" disabled={submitting}>
		<!-- Google "G" SVG icon -->
		{$t('auth.oauth_google')}
	</Button>
</form>
```

### 2. AuthCard update (`src/lib/components/ui/AuthCard.svelte`)

Imports `OAuthButtons` and renders it between the card header and the login/register form:

```svelte
<Card.Header>...</Card.Header>
<OAuthButtons />
<form method="POST" action="/actions?/auth" use:enhance>
```

### 3. OAuth callback route (`src/routes/oauth/callback/+page.server.ts`)

Server-side load function that:

1. Reads `code` ticket from URL query params
2. Validates ticket format (32-256 chars, alphanumeric + dash + underscore)
3. Calls `exchangeOAuthTicket(code)` which POSTs to `/auth/social/token/`
4. Sets `access_token` and `refresh_token` httpOnly cookies
5. Redirects to `/dash` on success, `/oauth/error` on failure
6. Sets `cache-control: no-store` and `referrer-policy: no-referrer` headers

```ts
export async function load({ cookies, setHeaders, url }) {
	setHeaders({ 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' });

	const code = url.searchParams.get('code');
	if (!code || !OAUTH_TICKET_PATTERN.test(code)) {
		redirect(303, '/oauth/error?reason=invalid_ticket');
	}

	try {
		const tokens = await exchangeOAuthTicket(code);
		if (!hasTokens(tokens)) throw new Error('Invalid token response');
		cookies.set('access_token', tokens.access, TOKEN_COOKIE_OPTIONS);
		cookies.set('refresh_token', tokens.refresh, TOKEN_COOKIE_OPTIONS);
		redirect(303, '/dash');
	} catch (error) {
		// 400/401/404/410 → invalid ticket; 500/503/network → provider unavailable
		redirect(303, '/oauth/error?...');
	}
}
```

### 4. OAuth error route (`src/routes/oauth/error/`)

Server page with `+page.server.ts` that validates the `reason` query param and renders an error message with a "Back to home" button.

### 5. Ticket exchange service (`src/lib/server/oauth.ts`)

Server-only module. Validates ticket format, calls `authApi.exchangeOAuthTicket(code)`.

```ts
const OAUTH_TICKET_PATTERN = /^[A-Za-z0-9_-]{32,256}$/;

export async function exchangeOAuthTicket(code: unknown): Promise<LoginResponse> {
	if (typeof code !== 'string' || !OAUTH_TICKET_PATTERN.test(code)) {
		throw new Error('Invalid OAuth ticket');
	}
	return authApi.exchangeOAuthTicket(code);
}
```

### 6. API client method (`src/lib/shared/api.ts`)

```ts
class AuthenticationApi extends AxiosInterceptor {
	async exchangeOAuthTicket(code: string): Promise<LoginResponse> {
		const response = await this.post('/auth/social/token/', { code });
		return response.data;
	}
}
```

### 7. Cookie options refactor (`src/lib/server/cookie-options.ts`, `cookies.ts`)

Extracted `createTokenCookieOptions(isDevelopment)` — sets `secure: !isDevelopment` so cookies work on `localhost` without HTTPS.

### 8. i18n keys

| Key                            | EN                                         | SK                                         |
| ------------------------------ | ------------------------------------------ | ------------------------------------------ |
| `auth.oauth_google`            | "Continue with Google"                     | "Prihlásiť cez Google"                     |
| `auth.oauth_github`            | "Continue with GitHub"                     | "Prihlásiť cez GitHub"                     |
| `auth.oauth_or`                | "or"                                       | "alebo"                                    |
| `auth.oauth_error_title`       | "Authentication failed"                    | "Overenie zlyhalo"                         |
| `auth.oauth_error_invalid`     | "The sign-in link is invalid..."           | "Prihlasovací odkaz je neplatný..."        |
| `auth.oauth_error_unavailable` | "The provider is currently unavailable..." | "Poskytovateľ je momentálne nedostupný..." |
| `auth.oauth_error_retry`       | "Back to home"                             | "Späť domov"                               |

---

## Tests

6 test files, 28 tests — all passing with Vitest:

| File                                         | Tests | Covers                                                                                                   |
| -------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------- |
| `src/lib/server/oauth.test.ts`               | 3     | Ticket validation, exchange call                                                                         |
| `src/lib/server/oauth-callback.test.ts`      | 7     | Callback route: malformed ticket, valid exchange, API errors (400-503), network failures, missing tokens |
| `src/lib/server/cookies.test.ts`             | 2     | Cookie options in dev vs prod                                                                            |
| `src/lib/shared/api.test.ts`                 | 3     | `exchangeOAuthTicket` API method                                                                         |
| `src/lib/components/ui/AuthCard.test.ts`     | 6     | AuthCard rendering, form modes                                                                           |
| `src/lib/components/ui/OAuthButtons.test.ts` | 7     | Button rendering, URL construction, form actions                                                         |

---

## What does NOT change

- `hooks.server.ts`, `+layout.server.ts`, `+layout.ts`, `+layout.svelte` — existing JWT cookie infrastructure handles OAuth tokens identically
- `actions/+page.server.ts` — no new auth action needed (callback sets cookies directly)
- `nav/actions.svelte` — AuthCard is rendered inside, no nav changes
- Types — same `LoginResponse` shape (`access` + `refresh`)
- Cookie policy — `sameSite: lax` works with OAuth redirects

---

## Files Summary

| File                                         | Status   | Purpose                       |
| -------------------------------------------- | -------- | ----------------------------- |
| `src/lib/components/ui/OAuthButtons.svelte`  | New      | Google + GitHub login buttons |
| `src/lib/components/ui/OAuthButtons.test.ts` | New      | Button tests                  |
| `src/lib/components/ui/AuthCard.svelte`      | Modified | Imports OAuthButtons          |
| `src/lib/components/ui/AuthCard.test.ts`     | New      | AuthCard tests                |
| `src/lib/server/oauth.ts`                    | New      | Ticket validation + exchange  |
| `src/lib/server/oauth.test.ts`               | New      | Ticket tests                  |
| `src/lib/server/oauth-callback.test.ts`      | New      | Callback route tests          |
| `src/lib/server/cookie-options.ts`           | New      | Env-aware cookie options      |
| `src/lib/server/cookies.ts`                  | Modified | Uses cookie-options           |
| `src/lib/server/cookies.test.ts`             | New      | Cookie tests                  |
| `src/lib/shared/api.ts`                      | Modified | `exchangeOAuthTicket` method  |
| `src/lib/shared/api.test.ts`                 | New      | API tests                     |
| `src/routes/oauth/callback/+page.server.ts`  | New      | Callback server load          |
| `src/routes/oauth/error/+page.server.ts`     | New      | Error page server load        |
| `src/routes/oauth/error/+page.svelte`        | New      | Error page UI                 |
| `src/lib/translations/en/auth.json`          | Modified | 7 new keys                    |
| `src/lib/translations/sk/auth.json`          | Modified | 7 new keys                    |
| `vitest.config.ts`                           | New      | Vitest configuration          |
| `tests/sveltekit/`                           | New      | Test environment mocks        |

---

## What's Still Needed (Backend-Actionable)

The frontend is complete. The backend (`ms_api`) needs:

1. `social-auth-app-django` installed and configured in settings
2. Custom pipeline step (`api/oauth.py`): `create_ticket_and_redirect`
3. `ExchangeOAuthTicketView` (`api/oauth.py`): `POST /auth/social/token/`
4. Django cache configured (`LocMemCache` for dev, `RedisCache` for prod)
5. Google + GitHub OAuth app credentials in env vars
6. `OAUTH_FRONTEND_CALLBACK` env var pointing to `http://localhost:5173/oauth/callback`
