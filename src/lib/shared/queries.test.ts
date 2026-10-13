import { describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
vi.mock('$app/environment', () => ({ browser: true }));
import { dayOptions, invalidateWeather, latestOptions, scope, statsOptions } from './queries';
import { createAppState } from './runes.svelte';
import { createApiClient } from './api';
describe('weather query identity', () => {
	it('separates station, date, session, and demo data', () => {
		const app = createAppState(
			{ id: 1, username: 'alice', email: '', has_usable_password: true, social_providers: [] },
			'1'
		);
		app.station = {
			id: 1,
			user: 1,
			name: 'A',
			city_name: 'A',
			latitude: 0,
			longitude: 0,
			created_at: ''
		};
		const api = createApiClient();
		const key = statsOptions(api, app, '2026-10-05', '2026-10-11').queryKey;
		app.stationId = 2;
		expect(statsOptions(api, app, '2026-10-05', '2026-10-11').queryKey).not.toEqual(key);
		app.stationId = 1;
		expect(statsOptions(api, app, '2026-10-04', '2026-10-11').queryKey).not.toEqual(key);
		app.demo = true;
		expect(statsOptions(api, app, '2026-10-05', '2026-10-11').queryKey).not.toEqual(key);
		app.demo = false;
		app.user = { ...app.user!, id: 2 };
		expect(statsOptions(api, app, '2026-10-05', '2026-10-11').queryKey).not.toEqual(key);
	});
	it('captures the selected station when the query is built', async () => {
		const app = createAppState(undefined, '1');
		const api = createApiClient();
		const spy = vi.spyOn(api, 'getLatestMeasurement').mockResolvedValue(null);
		const query = latestOptions(api, app);
		app.stationId = 2;
		await query.queryFn();
		expect(spy).toHaveBeenCalledWith(1);
	});
	it('disables invalid ranges and closed day details', () => {
		const app = createAppState(undefined, '1');
		app.station = {
			id: 1,
			user: 1,
			name: 'A',
			city_name: 'A',
			latitude: 0,
			longitude: 0,
			created_at: ''
		};
		const api = createApiClient();
		expect(statsOptions(api, app, '2026-10-05', '2026-10-11', false).enabled).toBe(false);
		expect(dayOptions(api, app, '2026-10-11', false).enabled).toBe(false);
	});
	it('invalidates all affected readings and ranges while leaving other sessions alone', async () => {
		const client = new QueryClient();
		const app = createAppState(undefined, '1');
		const keys = [
			...['latest', 'stats', 'day', 'forecast', 'stations'].map((section) => [
				...scope(app),
				section,
				1
			]),
			['weather', 'other', 'latest', 1]
		];
		for (const key of keys) client.setQueryData(key, []);
		await invalidateWeather(client, app);
		expect(keys.slice(0, -1).every((key) => client.getQueryState(key)?.isInvalidated)).toBe(true);
		expect(client.getQueryState(keys.at(-1)!)?.isInvalidated).toBe(false);
		client.clear();
	});
});
