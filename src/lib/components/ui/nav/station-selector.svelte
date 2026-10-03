<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { api } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import type { Measurement } from '@/shared/types';
	import { t } from '@/translations';
	import { createQuery } from '@tanstack/svelte-query';
	import Cookies from 'js-cookie';
	import dayjs from 'dayjs';
	import { AlertCircle, ChevronDown, Droplets, Thermometer, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { buttonVariants } from '../button';
	import * as Dialog from '../dialog';
	import { Skeleton } from '../skeleton';
	import StationList from '@/components/station/station-list.svelte';

	const stationsQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	const noStations = $derived(($stationsQuery.data?.results?.length ?? 0) === 0);
	const apiUnavailable = $derived($stationsQuery.isError);
	const selectedStation = $derived(
		$stationsQuery.data?.results?.find((s) => s.id === globalState.stationId) ?? globalState.station
	);

	let latestMeasurements = $state<Record<number, Measurement | null>>({});
	let loadingMeasurements = $state<Record<number, boolean>>({});
	let searchTerm = $state('');

	$effect(() => {
		if ($stationsQuery.data?.results.length) {
			fetchAllLatestMeasurements();
		}
	});

	async function fetchAllLatestMeasurements() {
		if (!$stationsQuery.data?.results.length) return;

		const stations = $stationsQuery.data.results;
		await Promise.allSettled(
			stations
				.filter((s) => latestMeasurements[s.id] === undefined)
				.map(async (station) => {
					loadingMeasurements[station.id] = true;
					try {
						const measurement = await api.getLatestMeasurement(station.id);
						if (measurement) measurement.timestamp = dayjs(measurement.timestamp);
						latestMeasurements[station.id] = measurement || null;
					} catch (error) {
						console.error(`Error fetching measurement for station ${station.id}:`, error);
						latestMeasurements[station.id] = null;
					} finally {
						loadingMeasurements[station.id] = false;
					}
					return station.id;
				})
		);
	}

	function setSelectedStation(stationId: number) {
		globalState.stationId = stationId;
		Cookies.set('defaultStationId', stationId.toString(), { expires: 365 });
		toast.success($t('menu.actions.selector.success'));
		invalidateAll();
	}

	const filteredStations = $derived(
		$stationsQuery.data?.results?.filter((s) =>
			`${s.name} ${s.city_name}`.toLowerCase().includes(searchTerm.toLowerCase())
		) ?? []
	);

	const emptyState = $derived(
		$stationsQuery.data?.results?.length === 0 && !$stationsQuery.isPending
	);
</script>

<Dialog.Root>
	<Dialog.Trigger
		aria-label={selectedStation
			? `${$t('menu.actions.selector.label')}: ${selectedStation.name}`
			: $t('menu.actions.selector.label')}
		class={buttonVariants({
			variant: 'ghost',
			class: 'min-h-11 max-w-36 min-w-0 shrink gap-2 px-2 py-1.5'
		})}
	>
		<img src="/favicon.png" alt="" class="size-5 rounded" />
		{#if selectedStation}
			<span class="min-w-0 truncate text-start text-xs font-semibold">{selectedStation.name}</span>
			<ChevronDown class="size-3 shrink-0 opacity-40" />
		{:else if $stationsQuery.isPending}
			<Skeleton class="h-3 w-16" />
		{:else if apiUnavailable}
			<AlertCircle class="text-destructive size-4 shrink-0" />
			<span class="sr-only">{$t('menu.actions.selector.api_unavailable')}</span>
		{:else if noStations}
			<AlertCircle class="text-muted-foreground size-4 shrink-0" />
			<span class="sr-only">{$t('menu.actions.selector.no_stations')}</span>
		{/if}
	</Dialog.Trigger>
	<Dialog.MobileContent class="flex max-w-4xl flex-col sm:max-h-[90vh] [&>button]:hidden">
		<Dialog.Header class="flex w-full flex-row justify-between">
			<div class="flex flex-col space-y-2">
				<Dialog.Title class="w-fit">{$t('menu.actions.selector.label')}</Dialog.Title>
				<Dialog.Description>
					{$t('menu.actions.selector.action')}
				</Dialog.Description>
			</div>
			<Dialog.Close
				aria-label={$t('menu.actions.selector.close')}
				class={buttonVariants({ variant: 'ghost', class: 'size-11' })}
			>
				<X class="size-4" />
			</Dialog.Close>
		</Dialog.Header>

		{#if emptyState}
			<div
				class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
			>
				<p class="text-sm font-semibold">{$t('menu.actions.selector.no_stations')}</p>
				<p class="mt-1 text-xs">{$t('menu.actions.selector.no_stations_hint')}</p>
			</div>
		{:else}
			<StationList
				stations={filteredStations}
				pending={$stationsQuery.isPending}
				error={apiUnavailable}
				selectedStationId={globalState.stationId}
				bind:search={searchTerm}
				onSelect={setSelectedStation}
			/>
		{/if}
	</Dialog.MobileContent>
</Dialog.Root>
