import { AxiosError, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const api = vi.hoisted(() => ({ getUsersMe: vi.fn(), refreshJwt: vi.fn() }));
vi.mock('$lib/shared/api', () => ({ authApi: api }));
import { handle } from '../../hooks.server';
function request(tokens: Record<string, string> = {}, path = '/dash') {
	const cookies = { get: vi.fn((key: string) => tokens[key]), set: vi.fn(), delete: vi.fn() };
	const event = { url: new URL('http://localhost:5173' + path), cookies, locals: {} };
	return { event, cookies };
}
const resolve = async () => new Response('ok');
const rejected = () =>
	new AxiosError('expired', undefined, undefined, undefined, { status: 401 } as AxiosResponse);
const run = (event: ReturnType<typeof request>['event']) =>
	handle({ event, resolve } as unknown as Parameters<typeof handle>[0]);
beforeEach(() => {
	api.getUsersMe.mockReset();
	api.refreshJwt.mockReset();
});
describe('request authentication', () => {
	it('keeps concurrent users tied to their own token', async () => {
		api.getUsersMe.mockImplementation(async (token: string) => ({ username: token }));
		const a = request({ access_token: 'alice' }),
			b = request({ access_token: 'bob' });
		await Promise.all([run(a.event), run(b.event)]);
		expect(a.event.locals).toMatchObject({ user: { username: 'alice' }, accessToken: 'alice' });
		expect(b.event.locals).toMatchObject({ user: { username: 'bob' }, accessToken: 'bob' });
	});
	it('validates and exposes the renewed access token on the same request', async () => {
		api.getUsersMe.mockRejectedValueOnce(rejected()).mockResolvedValueOnce({ username: 'alice' });
		api.refreshJwt.mockResolvedValueOnce({ access: 'new' });
		const { event, cookies } = request({ access_token: 'old', refresh_token: 'refresh' });
		await run(event);
		expect(event.locals).toMatchObject({ accessToken: 'new', user: { username: 'alice' } });
		expect(cookies.set).toHaveBeenCalledWith('access_token', 'new', expect.any(Object));
		expect(cookies.delete).not.toHaveBeenCalled();
	});
	it('recovers a refresh-only session', async () => {
		api.refreshJwt.mockResolvedValueOnce({ access: 'new' });
		api.getUsersMe.mockResolvedValueOnce({ username: 'alice' });
		const { event } = request({ refresh_token: 'refresh' });
		await run(event);
		expect(event.locals).toMatchObject({ accessToken: 'new' });
	});
	it('clears rejected credentials without treating transient outages as rejection', async () => {
		api.getUsersMe.mockRejectedValueOnce(rejected());
		api.refreshJwt.mockRejectedValueOnce(rejected());
		const bad = request({ access_token: 'old', refresh_token: 'bad' });
		await run(bad.event);
		expect(bad.cookies.delete).toHaveBeenCalledTimes(2);
		api.getUsersMe.mockRejectedValueOnce(new Error('offline'));
		const outage = request({ access_token: 'valid' });
		await run(outage.event);
		expect(outage.cookies.delete).not.toHaveBeenCalled();
		expect(outage.event.locals).toMatchObject({ authUnavailable: true });
	});
	it('does not contact auth services on read-only demo routes', async () => {
		const { event } = request({ access_token: 'alice', refresh_token: 'refresh' }, '/demo');
		await run(event);
		expect(api.getUsersMe).not.toHaveBeenCalled();
		expect(api.refreshJwt).not.toHaveBeenCalled();
		expect(event.locals).toEqual({});
	});
	it('marks authenticated responses private and redirects a signed-in landing visit', async () => {
		api.getUsersMe.mockResolvedValue({ username: 'alice' });
		const { event } = request({ access_token: 'alice' });
		expect((await run(event)).headers.get('cache-control')).toBe('private, no-store');
		await expect(run(request({ access_token: 'alice' }, '/').event)).rejects.toMatchObject({
			status: 303,
			location: '/dash'
		});
	});
});
