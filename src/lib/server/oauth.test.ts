import { describe, expect, it, vi } from 'vitest';

const exchangeTicketMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/shared/api', () => ({
	authApi: { exchangeOAuthTicket: exchangeTicketMock }
}));

import { exchangeOAuthTicket } from './oauth';

describe('exchangeOAuthTicket', () => {
	it.each([undefined, 123, '', 'a'.repeat(31), 'a'.repeat(257), 'a'.repeat(31) + '+'])(
		'rejects malformed OAuth tickets before the API call: %j',
		async (ticket) => {
			await expect(exchangeOAuthTicket(ticket)).rejects.toThrow('Invalid OAuth ticket');
			expect(exchangeTicketMock).not.toHaveBeenCalled();
		}
	);

	it('exchanges a URL-safe OAuth ticket through the authentication API', async () => {
		const ticket = 'Abcdefghijklmnopqrstuvwxyz0123456789_-';
		const tokens = { access: 'access-token', refresh: 'refresh-token' };
		exchangeTicketMock.mockResolvedValueOnce(tokens);

		await expect(exchangeOAuthTicket(ticket)).resolves.toEqual(tokens);
		expect(exchangeTicketMock).toHaveBeenCalledWith(ticket);
	});
});
