import { authApi } from '$lib/shared/api';
import type { LoginResponse } from '$lib/shared/types';

const OAUTH_TICKET_PATTERN = /^[A-Za-z0-9_-]{32,256}$/;

export async function exchangeOAuthTicket(code: unknown): Promise<LoginResponse> {
	if (typeof code !== 'string' || !OAUTH_TICKET_PATTERN.test(code)) {
		throw new Error('Invalid OAuth ticket');
	}

	return authApi.exchangeOAuthTicket(code);
}
