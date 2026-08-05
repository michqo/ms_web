import { TOKEN_COOKIE_OPTIONS } from '$lib/server/cookies';
import { AxiosError, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const exchangeOAuthTicketMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/oauth', () => ({
	exchangeOAuthTicket: exchangeOAuthTicketMock
}));

import { load } from '../../routes/oauth/callback/+page.server';

const validCode = 'Abcdefghijklmnopqrstuvwxyz0123456789_-';

function createEvent(code?: string) {
	const cookies = {
		get: vi.fn(),
		getAll: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn()
	};
	const setHeaders = vi.fn();
	const url = new URL('http://localhost:5173/oauth/callback');
	if (code !== undefined) url.searchParams.set('code', code);

	return {
		event: { cookies, setHeaders, url } as Parameters<typeof load>[0],
		cookies,
		setHeaders
	};
}

async function expectRedirect(event: Parameters<typeof load>[0], location: string) {
	await expect(load(event)).rejects.toMatchObject({ status: 303, location });
}

function axiosError(status: number) {
	return new AxiosError('ignored by callback', undefined, undefined, undefined, {
		status,
		data: { detail: 'ignored by callback' }
	} as AxiosResponse);
}

describe('GET /oauth/callback', () => {
	beforeEach(() => {
		exchangeOAuthTicketMock.mockReset();
	});

	it('rejects a missing or malformed ticket before the exchange API', async () => {
		for (const code of [undefined, '', 'a'.repeat(31), 'a'.repeat(31) + '+']) {
			exchangeOAuthTicketMock.mockClear();
			const { event, cookies, setHeaders } = createEvent(code);

			await expectRedirect(event, '/oauth/error?reason=invalid_ticket');

			expect(exchangeOAuthTicketMock).not.toHaveBeenCalled();
			expect(cookies.set).not.toHaveBeenCalled();
			expect(setHeaders).toHaveBeenCalledWith({
				'cache-control': 'no-store',
				'referrer-policy': 'no-referrer'
			});
		}
	});

	it('sets both token cookies and redirects to the dashboard after a valid exchange', async () => {
		exchangeOAuthTicketMock.mockResolvedValueOnce({
			access: 'access-token',
			refresh: 'refresh-token'
		});
		const { event, cookies, setHeaders } = createEvent(validCode);

		await expectRedirect(event, '/dash');

		expect(exchangeOAuthTicketMock).toHaveBeenCalledOnce();
		expect(exchangeOAuthTicketMock).toHaveBeenCalledWith(validCode);
		expect(cookies.set).toHaveBeenNthCalledWith(
			1,
			'access_token',
			'access-token',
			TOKEN_COOKIE_OPTIONS
		);
		expect(cookies.set).toHaveBeenNthCalledWith(
			2,
			'refresh_token',
			'refresh-token',
			TOKEN_COOKIE_OPTIONS
		);
		expect(setHeaders).toHaveBeenCalledWith({
			'cache-control': 'no-store',
			'referrer-policy': 'no-referrer'
		});
	});

	it.each([400, 401, 404, 410])('maps API ticket status %i to invalid_ticket', async (status) => {
		exchangeOAuthTicketMock.mockRejectedValueOnce(axiosError(status));
		const { event, cookies, setHeaders } = createEvent(validCode);

		await expectRedirect(event, '/oauth/error?reason=invalid_ticket');

		expect(exchangeOAuthTicketMock).toHaveBeenCalledOnce();
		expect(cookies.set).not.toHaveBeenCalled();
		expect(setHeaders).toHaveBeenCalledWith({
			'cache-control': 'no-store',
			'referrer-policy': 'no-referrer'
		});
	});

	it.each([500, 503])('maps API failure status %i to provider_unavailable', async (status) => {
		exchangeOAuthTicketMock.mockRejectedValueOnce(axiosError(status));
		const { event, cookies } = createEvent(validCode);

		await expectRedirect(event, '/oauth/error?reason=provider_unavailable');

		expect(exchangeOAuthTicketMock).toHaveBeenCalledOnce();
		expect(cookies.set).not.toHaveBeenCalled();
	});

	it('maps network failures to provider_unavailable without setting a partial cookie state', async () => {
		exchangeOAuthTicketMock.mockRejectedValueOnce(new Error('network unavailable'));
		const { event, cookies } = createEvent(validCode);

		await expectRedirect(event, '/oauth/error?reason=provider_unavailable');

		expect(exchangeOAuthTicketMock).toHaveBeenCalledOnce();
		expect(cookies.set).not.toHaveBeenCalled();
	});

	it('does not set either cookie when the exchange response lacks a token', async () => {
		exchangeOAuthTicketMock.mockResolvedValueOnce({ access: 'access-token' });
		const { event, cookies } = createEvent(validCode);

		await expectRedirect(event, '/oauth/error?reason=provider_unavailable');

		expect(cookies.set).not.toHaveBeenCalled();
	});
});
