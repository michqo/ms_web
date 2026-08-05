import { redirect, type Cookies } from '@sveltejs/kit';
import { isAxiosError } from 'axios';
import { exchangeOAuthTicket } from '$lib/server/oauth';
import { TOKEN_COOKIE_OPTIONS } from '$lib/server/cookies';

const OAUTH_TICKET_PATTERN = /^[A-Za-z0-9_-]{32,256}$/;
const INVALID_TICKET_STATUSES = new Set([400, 401, 404, 410]);

function hasTokens(tokens: unknown): tokens is { access: string; refresh: string } {
	return (
		typeof tokens === 'object' &&
		tokens !== null &&
		typeof (tokens as { access?: unknown }).access === 'string' &&
		typeof (tokens as { refresh?: unknown }).refresh === 'string'
	);
}

export async function load({
	cookies,
	setHeaders,
	url
}: {
	cookies: Cookies;
	setHeaders: (headers: Record<string, string>) => void;
	url: URL;
}) {
	setHeaders({
		'cache-control': 'no-store',
		'referrer-policy': 'no-referrer'
	});

	const code = url.searchParams.get('code');
	if (!code || !OAUTH_TICKET_PATTERN.test(code)) {
		redirect(303, '/oauth/error?reason=invalid_ticket');
	}

	let tokens: unknown;
	try {
		tokens = await exchangeOAuthTicket(code);
	} catch (error) {
		if (isAxiosError(error) && INVALID_TICKET_STATUSES.has(error.response?.status ?? 0)) {
			redirect(303, '/oauth/error?reason=invalid_ticket');
		}

		redirect(303, '/oauth/error?reason=provider_unavailable');
	}

	if (!hasTokens(tokens)) {
		redirect(303, '/oauth/error?reason=provider_unavailable');
	}

	cookies.set('access_token', tokens.access, TOKEN_COOKIE_OPTIONS);
	cookies.set('refresh_token', tokens.refresh, TOKEN_COOKIE_OPTIONS);
	redirect(303, '/dash');
}
