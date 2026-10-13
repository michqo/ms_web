<script lang="ts">
	import { createQuery, type QueryClient } from '@tanstack/svelte-query';
	import type { AppState } from '@/shared/runes.svelte';
	import type { WeatherApi } from '@/shared/api';
	import { statsOptions } from '@/shared/queries';
	let { app, api, client }: { app: AppState; api: WeatherApi; client: QueryClient } = $props();
	const date = $derived(app.stationId === 1 ? '2026-10-12' : '2026-10-13');
	const query = createQuery(
		() => statsOptions(api, app, date, date),
		() => client
	);
</script>

<p>{query.status}</p>
