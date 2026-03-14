<script lang="ts">
	import { api } from '@/shared';
	import { globalState, useMediaQuery } from '@/shared/runes.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import Cookies from 'js-cookie';
	import dayjs from 'dayjs';
	import { onMount, type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		locale: string;
		user?: string;
		defaultStationId?: string | null;
	}

	let { children, locale, user, defaultStationId }: Props = $props();

	// Initialize synchronously from server-provided cookie so the station
	// is known before any effects or queries run.
	if (defaultStationId && isNaN(globalState.stationId)) {
		globalState.stationId = parseInt(defaultStationId);
	}

	const stationsQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations()
	});

	onMount(() => {
		globalState.isMobile = useMediaQuery('(max-width: 640px)');
	});

	$effect(() => {
		if (!isNaN(globalState.stationId)) {
			Cookies.set('defaultStationId', globalState.stationId.toString(), { expires: 365 });
		}

		if ($stationsQuery.data?.results) {
			globalState.station = $stationsQuery.data.results.find(
				(station) => station.id === globalState.stationId
			);

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
