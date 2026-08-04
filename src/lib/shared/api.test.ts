import { describe, expect, it, vi } from 'vitest';

const postMock = vi.hoisted(() => vi.fn());

vi.mock('axios', () => {
	const client = {
		interceptors: { response: { use: vi.fn() } },
		defaults: { headers: { common: {} } },
		get: vi.fn(),
		post: postMock,
		put: vi.fn(),
		delete: vi.fn()
	};

	return { default: { create: vi.fn(() => client) } };
});

import { authApi } from './api';

describe('AuthenticationApi.exchangeOAuthTicket', () => {
	it('posts the ticket to the social token endpoint and returns the login response', async () => {
		const tokens = { access: 'access-token', refresh: 'refresh-token' };
		postMock.mockResolvedValueOnce({ data: tokens });

		await expect(authApi.exchangeOAuthTicket('a'.repeat(32))).resolves.toEqual(tokens);
		expect(postMock).toHaveBeenCalledWith('/auth/social/token/', { code: 'a'.repeat(32) });
	});
});
