<script lang="ts">
	import { page } from '$app/state';
	import { api } from '@/shared';
	import useLocalStorage, { globalState } from '@/shared/runes.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import type { Snippet } from 'svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const stationsQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations()
	});

	const defaultStationId = useLocalStorage('defaultStationId', undefined);
	const stationIdParam = $derived(page.params.station);
	$effect(() => {
		globalState.stationId = stationIdParam
			? parseInt(stationIdParam)
			: parseInt(defaultStationId.value);
		globalState.station = $stationsQuery.data?.results.find(
			(station) => station.id === globalState.stationId
		);
	});

	$effect(() => {
		if ($stationsQuery.data?.results.length && !globalState.stationId) {
			const firstStation = $stationsQuery.data.results[0];
			defaultStationId.value = firstStation.id.toString();
			toast.success('Station selected as default');
		}
	});
</script>

{@render children()}
