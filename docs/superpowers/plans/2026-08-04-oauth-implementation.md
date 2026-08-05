# OAuth Authentication — Web Implementation Plan

**Date:** 2026-08-04  
**Repo:** `ms_web`  
**Source spec:** `docs/superpowers/specs/2026-08-04-oauth-integration.md`  
**API plan:** `ms_api/docs/superpowers/plans/2026-08-04-oauth-implementation.md`  
**Status:** Ready after API contract/ADRs are accepted

## Outcome

Add Google and GitHub controls to existing authentication dialog. Provider flow remains a browser
navigation through Django. SvelteKit receives a short-lived one-time code, exchanges it with API from
server code, sets existing httpOnly JWT cookies, then redirects to `/dash`.

## Corrections to source spec

1. Callback receives `code`, never `access` or `refresh` in URL.
2. Callback performs one server-to-server `POST /auth/social/token/` exchange.
3. Provider start controls submit top-level `POST` forms. Plain GET links leave login-CSRF surface and
   conflict with current Python Social Auth guidance.
4. Successful callback needs no spinner page: server load always redirects before rendering.
5. Failure must not silently redirect home. Route to a translated, actionable error page.
6. Use `303` after callback, not `308`; authentication completion is a new GET navigation and should
   not preserve a prior method.
7. Fix token cookie `secure` behavior for local HTTP. Keep `Secure` in production.

## API contract dependency

Implementation assumes API counterpart provides:

| Method | URI                                 | Purpose                                |
| ------ | ----------------------------------- | -------------------------------------- |
| `POST` | `/auth/social/login/google-oauth2/` | Start Google browser flow              |
| `POST` | `/auth/social/login/github/`        | Start GitHub browser flow              |
| `POST` | `/auth/social/token/`               | Consume one-time code; return JWT pair |

API success redirect:

```text
{WEB_ORIGIN}/oauth/callback?code=<opaque-single-use-ticket>
```

API failure redirect:

```text
{WEB_ORIGIN}/oauth/error?reason=<stable-reason>&provider=<optional-provider>
```

Allowed reason values: `cancelled`, `invalid_state`, `email_unavailable`, `account_conflict`,
`provider_unavailable`, `invalid_ticket`, `unknown`. Web must map unknown values to generic copy and
must never render raw API/provider messages.

## Target flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Web as SvelteKit server
    participant API as Django API
    participant Provider as Google/GitHub

    User->>Browser: Click Continue with provider
    Browser->>API: Top-level POST /auth/social/login/{provider}/
    API->>Provider: 302 authorization
    Provider->>API: Callback with code + state
    API->>Browser: 303 /oauth/callback?code=ticket
    Browser->>Web: GET /oauth/callback?code=ticket
    Web->>API: POST /auth/social/token/ {code: ticket}
    API-->>Web: {access, refresh}
    Web-->>Browser: Set-Cookie x2; 303 /dash
```

## Security and UX requirements

- OAuth code/JWT handling stays in `+page.server.ts` and `$lib/server`; never client JavaScript.
- Callback and error responses use `Cache-Control: no-store` and `Referrer-Policy: no-referrer`.
- Query code disappears immediately through redirect, successful or failed.
- Existing cookie names and JWT auth header remain unchanged.
- Cookies: `path=/`, `httpOnly`, `sameSite=lax`, `secure=!dev`.
- Do not persist token, ticket, provider response, or email in local/session storage.
- Social controls remain available on login and registration tabs; wording uses “Continue” so action
  covers both create and sign-in behavior.
- Submit state prevents repeat clicks, provider controls have visible focus states, icons are
  decorative, and full accessible provider name remains in text.
- Password login remains usable during provider/API outage.

## File map

| File                                        | Action          | Responsibility                                     |
| ------------------------------------------- | --------------- | -------------------------------------------------- |
| `src/lib/server/cookies.ts`                 | Modify          | Environment-correct token cookie options           |
| `src/lib/server/oauth.ts`                   | Add             | Validate ticket and call API exchange              |
| `src/lib/shared/api.ts`                     | Modify          | Typed `exchangeOAuthTicket` API method             |
| `src/lib/shared/types.ts`                   | Modify          | OAuth provider/reason/request types only if reused |
| `src/lib/components/ui/OAuthButtons.svelte` | Add             | Provider POST controls + divider                   |
| `src/lib/components/ui/AuthCard.svelte`     | Modify          | Place social controls outside credential form      |
| `src/routes/oauth/callback/+page.server.ts` | Add             | Code exchange, cookie set, redirect                |
| `src/routes/oauth/error/+page.server.ts`    | Add             | Normalize allowlisted reason/provider              |
| `src/routes/oauth/error/+page.svelte`       | Add             | Translated recovery UI                             |
| `src/lib/translations/en/auth.json`         | Modify          | Provider/callback/error copy                       |
| `src/lib/translations/sk/auth.json`         | Modify          | Slovak equivalents                                 |
| `package.json`                              | Optional modify | Add Vitest if automated web tests accepted         |

No changes expected in `hooks.server.ts`, `+layout.server.ts`, `+layout.ts`, or client auth header
logic beyond regression fixes discovered by verification.

## Implementation tasks

### Task 1 — Shared server contract and cookie correction

1. Modify `src/lib/server/cookies.ts`:
   - Import `dev` from `$app/environment`.
   - Change `secure: true` to `secure: !dev`.
   - Preserve `path: '/'`, `httpOnly: true`, `sameSite: 'lax'`.
   - Keep one exported object so password login, refresh, logout, deletion, and OAuth use identical
     options.
2. Add `exchangeOAuthTicket(code)` to `AuthenticationApi` in `src/lib/shared/api.ts`:
   - `POST /auth/social/token/` with JSON `{ code }`.
   - Return existing `LoginResponse`; do not invent duplicate JWT type.
   - This method is called only from server code. Add a comment or server-only wrapper to prevent
     accidental client use.
3. Prefer stronger boundary: add `src/lib/server/oauth.ts` that imports `authApi`, validates ticket
   shape, calls exchange, and returns `LoginResponse`. Callback route imports this server module.
   `$lib/server` prevents client bundling.
4. Ticket pre-validation:
   - String only.
   - 32–256 characters.
   - URL-safe token character set.
   - Reject before API call when malformed.
   - Do not log rejected value.

Verification:

```bash
pnpm check
pnpm lint
```

Manual local cookie check: username/password login over `http://localhost:5173` must now store both
cookies. Production build must still emit `Secure` cookies.

### Task 2 — Reusable provider controls

Create `src/lib/components/ui/OAuthButtons.svelte`.

Behavior:

- Render two independent forms using `method="POST"` and absolute action URLs derived from
  `PUBLIC_API_URL`:
  - `/auth/social/login/google-oauth2/`
  - `/auth/social/login/github/`
- Construct URLs with `new URL(path, normalizedBase)` rather than string concatenation. This avoids
  doubled/missing slashes. Confirm `PUBLIC_API_URL` contract is origin/base URL, not an `/api/`
  prefix that would produce wrong auth path.
- Use native top-level form submission. Do not use `enhance`, `fetch`, `goto`, `target="_blank"`, or
  client token handling.
- A button click disables both provider controls until navigation starts. If navigation is blocked,
  restore controls on `pageshow`.
- Use existing shadcn/Tailwind button primitives and project focus styles.
- Include provider SVGs locally; mark SVG `aria-hidden="true"` and `focusable="false"`.
- Render translated `auth.oauth_google`, `auth.oauth_github`, and `auth.oauth_or`.
- Hide or disable controls in mock/demo mode because provider flow cannot be mocked by current client
  mode. Explain with translated helper text only if disabled state would confuse users.

Modify `AuthCard.svelte`:

- Insert `OAuthButtons` after card header and before credentials `<form>`.
- Keep provider forms outside password form; nested forms are invalid HTML.
- Keep divider visually attached to credentials area.
- Render same controls for `login` and `register` tabs.
- Verify mobile and desktop dialog widths, keyboard order, and dark mode.

### Task 3 — Server-only callback

Add `src/routes/oauth/callback/+page.server.ts` with typed `PageServerLoad`.

Algorithm:

1. Set `Cache-Control: no-store` and `Referrer-Policy: no-referrer`.
2. Read `code` once from `url.searchParams`.
3. If missing/malformed, `redirect(303, '/oauth/error?reason=invalid_ticket')`.
4. Exchange code through `$lib/server/oauth.ts`.
5. On success, set `access_token` and `refresh_token` with `TOKEN_COOKIE_OPTIONS`.
6. `redirect(303, '/dash')`.
7. On API `400/401/404/410`, redirect to `invalid_ticket`.
8. On timeout/5xx/network error, redirect to `provider_unavailable` or a separate stable
   `exchange_unavailable` reason if API contract adds it.
9. Do not include code, Axios response body, or exception string in redirect/log.

No `+page.svelte` needed. Every path redirects. If framework requires a page component during
implementation, use an empty component; do not add a client spinner that keeps code URL visible.

Important redirect behavior:

- In SvelteKit, call `redirect(303, ...)` according to installed version semantics; do not catch the
  framework redirect exception in broad `catch`.
- Restrict `try/catch` to the exchange call, then set cookies/redirect outside catch.
- Existing `hooks.server.ts` validates the new access token on `/dash`; that is desired defense in
  depth.

### Task 4 — Safe error route

Add `src/routes/oauth/error/+page.server.ts`:

- Allowlist `reason` and `provider`; default to `unknown`.
- Strip all other query data from returned page data.
- Set no-store/no-referrer headers.
- Optionally canonicalize with a redirect to the sanitized query if unexpected parameters arrive.

Add `src/routes/oauth/error/+page.svelte`:

- Generic title and reason-specific safe explanation.
- “Try Google again” and “Try GitHub again” POST forms through reusable `OAuthButtons`.
- “Use username and password” control returns home and opens auth dialog if a safe mechanism exists;
  otherwise link home with clear copy.
- Never display raw `message` query parameter.
- Page title translated.
- Responsive centered card; no authenticated dashboard data dependency.

### Task 5 — i18n

Add at least these keys to English and Slovak `auth.json`:

```text
oauth_google
oauth_github
oauth_or
oauth_error_title
oauth_error_generic
oauth_error_cancelled
oauth_error_invalid_state
oauth_error_email_unavailable
oauth_error_account_conflict
oauth_error_provider_unavailable
oauth_error_invalid_ticket
oauth_try_again
oauth_use_password
oauth_mock_unavailable
```

Use stable key-to-reason mapping in code. Do not construct translation key directly from untrusted
query value without allowlisting.

The `auth` translation loader has no route restriction, so keys are available on `/oauth/error`.
Verify SSR and hydration in both locales.

### Task 6 — Automated and manual verification

Current repo has no test framework. Choose one explicitly:

**Recommended:** add Vitest as focused dev dependency and a `test` script. Test server helper and
reason normalization as pure units. Avoid introducing full browser testing stack only for this
feature.

Automated cases:

- Valid callback code calls exchange once, sets both exact cookies, redirects `303 /dash`.
- Missing/malformed code never calls API and redirects to safe error.
- Invalid/expired/used ticket maps to `invalid_ticket`.
- API/network failure maps to safe generic failure.
- Redirect thrown after success is not swallowed.
- Cookie `secure` is false in dev and true in production build/environment mock.
- Reason/provider query allowlists reject arbitrary strings and raw messages.
- Provider URL builder handles base URL with and without trailing slash.
- OAuth controls are outside credential form and use POST actions.

Static verification:

```bash
pnpm test
pnpm check
pnpm lint
pnpm build
```

Manual browser matrix:

| Case                                               | Expected                                               |
| -------------------------------------------------- | ------------------------------------------------------ |
| New Google user                                    | One user + association; `/dash`; URL clean             |
| Existing password user, same verified Google email | Same user; `/dash`                                     |
| Repeat Google login                                | Same user and association                              |
| New GitHub user with private verified email        | User created; `/dash`                                  |
| Both providers, same verified email                | Same app user                                          |
| Provider cancel                                    | Safe translated error; retry works                     |
| Missing/unverified provider email                  | Safe email error; password option works                |
| Expired or replayed ticket                         | Safe invalid-ticket error; no cookies                  |
| API unavailable during exchange                    | Safe error; no partial cookie state                    |
| Already authenticated user starts OAuth            | Define API behavior; no accidental account switch/link |
| Refresh after OAuth login                          | Existing refresh path works                            |
| Logout after OAuth login                           | Both JWT cookies removed                               |
| Direct `/oauth/callback` navigation                | Safe invalid-ticket error                              |
| English/Slovak, mobile/desktop, light/dark         | Correct copy/layout/focus                              |
| Demo mode                                          | Social controls disabled/hidden as designed            |

Browser security inspection:

- Network: provider redirect URL contains only provider auth data; frontend callback contains one-time
  ticket, never JWT.
- Application cookies: both tokens are httpOnly; production also Secure; SameSite=Lax.
- Browser history after completion contains `/dash`, not callback/JWT.
- Console/local storage/session storage contain no ticket or token.
- Referrer policy is no-referrer on callback/error responses.

### Task 7 — Release sequence

1. API deployed and provider callbacks configured first.
2. Validate API start and completion routes in staging without exposing web controls broadly.
3. Deploy web callback/error routes before buttons if releases cannot be atomic.
4. Deploy provider controls.
5. Run full manual matrix on production origins.
6. Watch safe aggregate metrics: starts by provider, completions, exchange successes, failures by
   stable reason. Never record query string, code, JWT, provider token, or email.

Rollback:

- Hide/remove `OAuthButtons`; password auth remains.
- Keep callback/error routes deployed for in-flight users.
- Do not roll back API migration before all in-flight tickets expire.

## ADRs

### ADR-WEB-001 — Server-side ticket exchange

**Status:** Proposed  
**Decision:** SvelteKit server exchanges one-time code and stores returned JWTs in httpOnly cookies.  
**Alternatives:** JWT redirect query (credential leakage); browser exchange (ticket/JWT exposed to
client JS); API cross-domain cookies (deployment coupling).  
**Consequences:** One API round-trip added during login; current auth/cookie model remains intact.

### ADR-WEB-002 — Native provider POST navigation

**Status:** Proposed  
**Decision:** Provider controls are normal top-level POST forms to API.  
**Alternatives:** GET anchors (login-CSRF exposure); enhanced/fetched POST (redirect/session handling
wrong for provider navigation).  
**Consequences:** Controls cannot use SvelteKit form enhancement. API must validate frontend Origin.

### ADR-WEB-003 — Dedicated safe error route

**Status:** Proposed  
**Decision:** Callback always redirects; sanitized error data renders on `/oauth/error`.  
**Alternatives:** Silent home redirect (poor recovery); render callback directly (ticket URL lingers);
raw provider message (information/XSS risk).  
**Consequences:** Two small route files and additional translations required.

## Risks and mitigations

| Risk                           | Mitigation                                                              |
| ------------------------------ | ----------------------------------------------------------------------- |
| JWT leak through URL           | One-time ticket exchange; server-only token handling.                   |
| Callback ticket leak           | Short TTL/use-once; instant redirect; no-store/no-referrer; no logging. |
| Nested forms in auth card      | Dedicated provider component placed outside credential form.            |
| Local login cookies not stored | `secure: !dev`; production regression test keeps Secure.                |
| Duplicate submission           | Disable controls during navigation; API ticket/association constraints. |
| Raw provider error rendered    | Allowlist reason/provider; translated fixed copy only.                  |
| API base URL slash/path bug    | `URL` construction plus unit cases.                                     |
| Provider outage                | Password form remains available; recovery page.                         |
| Redirect exception swallowed   | Narrow catch around API call only.                                      |
| Non-atomic cross-repo rollout  | API first, callback/error routes second, buttons last.                  |

## Definition of done

- Provider buttons work through POST on login and register tabs.
- Callback URL never contains JWTs.
- Exchange happens only in server code.
- Both cookies use shared options and work on local HTTP + production HTTPS.
- Successful OAuth reaches authenticated `/dash`; refresh/logout/delete paths regress cleanly.
- All failure cases reach translated safe recovery UI without raw exception data.
- `pnpm test`, `pnpm check`, `pnpm lint`, and `pnpm build` pass.
- API counterpart definition of done and cross-browser manual matrix pass.
