import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
	createJwt: vi.fn(),
	postUser: vi.fn(),
	deleteAccount: vi.fn(),
	createApiClient: vi.fn()
}));
vi.mock('@/shared/api', () => ({
	authApi: api,
	createApiClient: api.createApiClient
}));
import { actions } from './+page.server';

function event(id: string, values: Record<string, string>, oauth = false) {
	const body = new FormData();
	body.set('__superform_id', id);
	for (const [key, value] of Object.entries(values)) body.set(key, value);
	const cookies = { set: vi.fn(), delete: vi.fn() };
	return {
		request: new Request('http://localhost:5173/actions', { method: 'POST', body }),
		cookies,
		locals: { accessToken: 'test-token', user: { id: 1, has_usable_password: !oauth } }
	} as unknown as Parameters<typeof actions.auth>[0];
}

beforeEach(() => {
	vi.resetAllMocks();
	api.createApiClient.mockReturnValue({ deleteAccount: api.deleteAccount });
});

describe('account form outcomes', () => {
	it('marks rejected login invalid without issuing cookies', async () => {
		api.createJwt.mockRejectedValue(new Error('rejected'));
		const request = event('login', { username: 'fixture', password: 'fixture' });
		expect(await actions.auth(request)).toMatchObject({
			status: 401,
			data: { form: { valid: false } }
		});
		expect(request.cookies.set).not.toHaveBeenCalled();
	});
	it('issues both cookies only after successful login', async () => {
		api.createJwt.mockResolvedValue({ access: 'new-access', refresh: 'new-refresh' });
		const request = event('login', { username: 'fixture', password: 'fixture' });
		expect(await actions.auth(request)).toMatchObject({ form: { valid: true } });
		expect(request.cookies.set).toHaveBeenCalledWith(
			'access_token',
			'new-access',
			expect.any(Object)
		);
		expect(request.cookies.set).toHaveBeenCalledWith(
			'refresh_token',
			'new-refresh',
			expect.any(Object)
		);
	});
	it('returns registration errors without attempting token creation', async () => {
		api.postUser.mockRejectedValue(new Error('unavailable'));
		const request = event('register', { username: 'fixture', password: 'fixture' });
		expect(await actions.auth(request)).toMatchObject({
			status: 400,
			data: { form: { valid: false } }
		});
		expect(api.createJwt).not.toHaveBeenCalled();
	});
	it('rejects an unknown form action', async () => {
		expect(
			await actions.auth(event('unknown', { username: 'fixture', password: 'fixture' }))
		).toMatchObject({ status: 400 });
		expect(api.createJwt).not.toHaveBeenCalled();
		expect(api.postUser).not.toHaveBeenCalled();
	});
	it('keeps a failed OAuth account deletion invalid and preserves the session', async () => {
		api.deleteAccount.mockRejectedValue(new Error('unavailable'));
		const request = event('delete', { is_oauth: 'true' }, true);
		expect(await actions.delete(request)).toMatchObject({
			status: 401,
			data: { form: { valid: false } }
		});
		expect(request.cookies.delete).not.toHaveBeenCalled();
	});
	it('uses the request token and lets the successful deletion redirect escape', async () => {
		api.deleteAccount.mockResolvedValue(undefined);
		const request = event('delete', { current_password: 'fixture' });
		await expect(actions.delete(request)).rejects.toMatchObject({ status: 303, location: '/' });
		expect(api.createApiClient).toHaveBeenCalledWith('test-token');
		expect(request.cookies.delete).toHaveBeenCalledTimes(2);
	});
});
