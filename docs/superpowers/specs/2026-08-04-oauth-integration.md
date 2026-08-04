# OAuth Authentication — Frontend

**Date:** 2026-08-04
**Repo:** ms_web (SvelteKit frontend)
**Status:** Design — awaiting implementation

## Goal

Add OAuth2 social login buttons (Google, GitHub) to the existing username/password auth UI. Handle the OAuth callback by reading JWT tokens from URL parameters and setting httpOnly cookies.

**Backend counterpart:** `ms_api/docs/superpowers/specs/2026-08-04-oauth-integration.md`

---

## Architecture

```
User clicks "Sign in with Google" in AuthCard
        │
        │  href link to backend OAuth endpoint
        ▼
Browser navigates to backend:
  GET <API_URL>/auth/social/login/google-oauth2/
        │
        │  Backend handles full OAuth flow (see backend spec)
        ▼
Browser redirected back to frontend:
  /oauth/callback?access=<jwt>&refresh=<jwt>
        │
        │  +page.server.ts reads URL params server-side
        │  Sets httpOnly cookies (access_token, refresh_token)
        │  Redirects to /dash
        ▼
User lands on /dash — authenticated, dashboard loads
```

**Contract with backend:**

- Backend redirects to `{OAUTH_FRONTEND_CALLBACK}?access=<jwt>&refresh=<jwt>`
- Frontend reads `access` and `refresh` from URL query params
- Same `LoginResponse` type — no new API calls, no new types

---

## Files Changed

### 1. New route: OAuth callback (`src/routes/oauth/callback/+page.server.ts`)

Server-side load function. Tokens extracted from URL and stored as httpOnly cookies — never touch client-side JavaScript.

```ts
import { redirect } from '@sveltejs/kit';
import { TOKEN_COOKIE_OPTIONS } from '$lib/server/cookies';

export const load = async ({ url, cookies }) => {
	const access = url.searchParams.get('access');
	const refresh = url.searchParams.get('refresh');

	if (access && refresh) {
		cookies.set('access_token', access, TOKEN_COOKIE_OPTIONS);
		cookies.set('refresh_token', refresh, TOKEN_COOKIE_OPTIONS);
		redirect(308, '/dash');
	}

	redirect(308, '/');
};
```

### 2. New route: OAuth callback UI (`src/routes/oauth/callback/+page.svelte`)

Minimal client-side fallback. Only renders if the server-side load hasn't redirected yet (rare race condition, or if tokens missing). Shows a centered spinner while the redirect resolves.

```svelte
<svelte:head>
	<title>{$t('auth.oauth_callback_title')}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<Loader2 class="text-muted-foreground size-8 animate-spin" />
</div>
```

### 3. Update AuthCard (`src/lib/components/ui/AuthCard.svelte`)

Add OAuth provider buttons between the description and the login/register form, with an "or" divider. The buttons are `<a>` links that navigate to the backend OAuth endpoints.

```svelte
<script lang="ts">
	// ... existing imports ...
	import { PUBLIC_API_URL } from '$env/static/public';
</script>

<!-- Inside the Card.Content, before the form -->
<div class="mb-6 grid grid-cols-1 gap-2">
	<a
		href={`${PUBLIC_API_URL}/auth/social/login/google-oauth2/`}
		class="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors"
	>
		<svg viewBox="0 0 24 24" class="size-4"><!-- Google "G" icon --></svg>
		{$t('auth.oauth_google')}
	</a>
	<a
		href={`${PUBLIC_API_URL}/auth/social/login/github/`}
		class="border-border hover:bg-muted flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors"
	>
		<svg viewBox="0 0 24 24" class="size-4"><!-- GitHub icon --></svg>
		{$t('auth.oauth_github')}
	</a>
</div>

<div class="mb-6 flex items-center gap-3">
	<div class="bg-border h-px flex-1"></div>
	<span class="text-muted-foreground text-xs">{$t('auth.oauth_or')}</span>
	<div class="bg-border h-px flex-1"></div>
</div>
```

**Design note:** The OAuth links use `href` (standard navigation), not `onclick` + `goto()`. This is a full-page navigation to the backend URL, which triggers the OAuth redirect chain. The `sameSite: lax` cookie policy allows this because it's a top-level navigation.

### 4. Add i18n keys (`src/lib/translations/en/auth.json`)

Merge these keys into the existing file:

```json
{
	"oauth_google": "Continue with Google",
	"oauth_github": "Continue with GitHub",
	"oauth_or": "or",
	"oauth_callback_title": "Signing in..."
}
```

### 5. Add i18n keys (`src/lib/translations/sk/auth.json`)

```json
{
	"oauth_google": "Prihlásiť cez Google",
	"oauth_github": "Prihlásiť cez GitHub",
	"oauth_or": "alebo",
	"oauth_callback_title": "Prihlasujem..."
}
```

---

## What does NOT change

- **No new API calls** — the callback route reads URL params server-side, no fetch needed
- **No new types** — same `LoginResponse` shape (`access` + `refresh`)
- **No new schemas** — no form validation needed for OAuth callback
- **No changes to** `hooks.server.ts`, `+layout.server.ts`, `+layout.ts`, `api.ts` — existing auth infrastructure handles JWT cookies exactly as before
- **No changes to** `nav/actions.svelte` — AuthCard is rendered inside the existing dialog
- **No cookie config changes** — `TOKEN_COOKIE_OPTIONS` (httpOnly, secure, sameSite: lax) is OAuth-compatible

---

## Edge Cases

| Scenario                                                              | Handling                                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| OAuth callback without tokens (user cancels, error)                   | `+page.server.ts` redirects to `/`                                                                          |
| Tokens in URL are expired/invalid                                     | `hooks.server.ts` will fail `getUsersMe` → refresh attempt → if that fails, cookies deleted (existing flow) |
| User already has password account, logs in via Google with same email | Backend links identities. Frontend sees same JWT flow — no difference                                       |
| User navigates directly to `/oauth/callback` without tokens           | Redirect to `/`                                                                                             |
| Backend `OAUTH_FRONTEND_CALLBACK` doesn't match frontend URL          | Tokens sent to wrong URL. Catch-all redirect to `/`                                                         |

---

## Files Summary

| File                                        | Action                                          |
| ------------------------------------------- | ----------------------------------------------- |
| `src/routes/oauth/callback/+page.server.ts` | **New** — server-side token → cookie → redirect |
| `src/routes/oauth/callback/+page.svelte`    | **New** — minimal spinner UI                    |
| `src/lib/components/ui/AuthCard.svelte`     | **Modify** — add OAuth buttons + divider        |
| `src/lib/translations/en/auth.json`         | **Modify** — add 4 keys                         |
| `src/lib/translations/sk/auth.json`         | **Modify** — add 4 keys                         |
