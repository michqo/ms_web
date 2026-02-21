<script lang="ts">
	import { api } from '@/shared';
	import { globalState, useLocalStorage, useMediaQuery } from '@/shared/runes.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { onMount, type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		locale: string;
		user?: string;
	}

	let { children, locale, user }: Props = $props();

	const stationsQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations()
	});

	onMount(() => {
		globalState.isMobile = useMediaQuery('(max-width: 640px)');
	});

	const defaultStationId = useLocalStorage('defaultStationId', undefined);

	$effect(() => {
		// Sync defaultStationId.value (localStorage) -> globalState.stationId
		if (isNaN(globalState.stationId) && defaultStationId.value) {
			globalState.stationId = parseInt(defaultStationId.value);
		}
	});

	$effect(() => {
		// Sync globalState.stationId -> defaultStationId.value (localStorage)
		if (!isNaN(globalState.stationId)) {
			defaultStationId.value = globalState.stationId.toString();
		}

		if ($stationsQuery.data?.results) {
			globalState.station = $stationsQuery.data.results.find(
				(station) => station.id === globalState.stationId
			);

			// Initial setup if no station is found in localStorage
			if (isNaN(globalState.stationId) && $stationsQuery.data.results.length > 0) {
				const firstStation = $stationsQuery.data.results[0];
				globalState.stationId = firstStation.id;
			}
		}
	});

	$effect(() => {
		globalState.user = user;
		dayjs.locale(locale);
	});
</script>

{@render children()}
