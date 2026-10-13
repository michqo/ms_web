// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { QueryClient } from '@tanstack/svelte-query';
vi.mock('$app/environment', () => ({ browser: true }));
import QueryLifecycle from '../../../tests/QueryLifecycle.svelte';
import { createAppState } from './runes.svelte';
import { createApiClient } from './api';

describe('weather query lifecycle', () => {
	it('stops observing destroyed views and mounts fresh queries after station changes', async () => {
		const app = createAppState(undefined, '1');
		app.station = {
			id: 1,
			user: 1,
			name: 'Test',
			city_name: '',
			latitude: 0,
			longitude: 0,
			created_at: ''
		};
		const api = createApiClient();
		const reads = vi.spyOn(api, 'getMeasurementStats').mockResolvedValue([]);
		const warnings = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const target = document.createElement('div');
		document.body.append(target);
		let view: Record<string, never> | undefined;
		try {
			view = mount(QueryLifecycle, { target, props: { app, api, client } });
			flushSync();
			await vi.waitFor(() => expect(target.textContent).toBe('success'));
			expect(reads).toHaveBeenCalledTimes(1);
			expect(client.getQueryCache().getAll()[0].getObserversCount()).toBe(1);

			await unmount(view);
			view = undefined;
			app.stationId = 2;
			flushSync();
			await client.invalidateQueries();
			expect(reads).toHaveBeenCalledTimes(1);
			expect(
				client
					.getQueryCache()
					.getAll()
					.every((query) => query.getObserversCount() === 0)
			).toBe(true);
			expect(
				warnings.mock.calls.flat().some((message) => String(message).includes('derived_inert'))
			).toBe(false);

			view = mount(QueryLifecycle, { target, props: { app, api, client } });
			flushSync();
			await vi.waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
			expect(reads.mock.calls[1][0]).toBe(2);
			await vi.waitFor(() => expect(target.textContent).toBe('success'));
		} finally {
			if (view) await unmount(view);
			client.clear();
			target.remove();
			warnings.mockRestore();
		}
	});
});
