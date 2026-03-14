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
		if ($stationsQuery.data?.results) {
			const found = $stationsQuery.data.results.find(
				(station) => station.id === globalState.stationId
			);

			if (found) {
				// Station from cookie exists — keep it
				globalState.station = found;
				Cookies.set('defaultStationId', found.id.toString(), { expires: 365 });
			} else if ($stationsQuery.data.results.length > 0) {
				// Stale cookie (station deleted) — fall back to first available
				const first = $stationsQuery.data.results[0];
				globalState.stationId = first.id;
				globalState.station = first;
				Cookies.set('defaultStationId', first.id.toString(), { expires: 365 });
			} else {
				// No stations at all — clear everything
				globalState.stationId = NaN;
				globalState.station = undefined;
				Cookies.remove('defaultStationId');
			}
		}
	});

	$effect(() => {
		globalState.user = user;
		dayjs.locale(locale);
	});
</script>

{@render children()}
