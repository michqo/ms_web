<script lang="ts">
	import StationDialog from '@/components/station/station-dialog.svelte';
	import { Button } from '@/components/ui/button';
	import { Skeleton } from '@/components/ui/skeleton';
	import { Map } from '@/components/ui/map';
	import { api } from '@/shared';
	import useLocalStorage, { globalState } from '@/shared/runes.svelte';
	import type { Measurement, Station } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { CheckCircle2, Droplets, Edit, Plus, Thermometer } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { t } from '@/translations';

	const stationsQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	let selectedStation: Partial<Station> | undefined = $state();
	let dialogOpen = $state(false);
	const defaultStationId = useLocalStorage('defaultStationId', undefined);

	let latestMeasurements = $state<Record<number, Measurement | null>>({});
	let loadingMeasurements = $state<Record<number, boolean>>({});

	const defaultStation = $derived(
		$stationsQuery.data?.results.find((station) => station.id.toString() === defaultStationId.value)
	);
	const otherStations = $derived(
		$stationsQuery.data?.results.filter(
			(station) => station.id.toString() !== defaultStationId.value
		)
	);

	$effect(() => {
		// When stations load, fetch measurements for all stations
		if ($stationsQuery.data?.results.length) {
			fetchAllLatestMeasurements();
		}
	});

	async function fetchAllLatestMeasurements() {
		if (!$stationsQuery.data?.results.length) return;

		try {
			for (const station of $stationsQuery.data.results) {
				try {
					loadingMeasurements[station.id] = true;
					const measurement = await api.getLatestMeasurement(station.id);
					measurement.timestamp = dayjs(measurement.timestamp);
					latestMeasurements[station.id] = measurement || null;
				} catch (error) {
					console.error(`Error fetching measurement for station ${station.id}:`, error);
					latestMeasurements[station.id] = null;
				} finally {
					loadingMeasurements[station.id] = false;
				}
			}
		} catch (error) {
			console.error('Error fetching measurements:', error);
		}
	}

	function openDialog(station?: Partial<Station>) {
		selectedStation = station || undefined;
		dialogOpen = true;
	}

	function setSelectedStation(stationId: number) {
		defaultStationId.value = stationId.toString();
		toast.success('Station selected as default');
	}
</script>

{#snippet card(station: Station)}
	{@const latest = latestMeasurements[station.id]}
	{@const loading = loadingMeasurements[station.id]}
	{@const isDefault = defaultStationId.value == station.id.toString()}
	<li
		class="group relative flex flex-col rounded-lg border {isDefault
			? 'border-primary bg-muted/30 w-full'
			: 'border-border w-sm'} hover:border-primary px-8 py-4 shadow-lg"
	>
		{#if globalState.user}
			<div
				class="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<Button
					variant={globalState.stationId == station.id ? 'default' : 'ghost'}
					size="icon"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setSelectedStation(station.id);
					}}
					title={$t('home.setDefault')}
				>
					<CheckCircle2 class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						openDialog(station);
					}}
				>
					<Edit class="h-4 w-4" />
				</Button>
			</div>
		{/if}
		<a href="/measurements?station={station.id}" class="flex flex-col">
			<div class="flex items-center gap-2">
				<span>{station.name}</span>
				{#if defaultStationId.value == station.id.toString()}
					<span class="text-muted-foreground text-xs">({$t('home.default')})</span>
				{/if}
			</div>
			<span class="text-muted-foreground">{station.city_name}</span>

			{#if station.latitude && station.longitude}
				<div class="mt-3 mb-2 w-full overflow-hidden rounded-md">
					<Map
						latitude={station.latitude}
						longitude={station.longitude}
						zoom={isDefault ? 15 : 13}
						class={isDefault ? 'h-[250px]' : 'h-[100px]'}
						preview={true}
					/>
				</div>
			{/if}

			<div class="mt-3 grid grid-cols-2 gap-2 border-t pt-2">
				<div class="flex items-center gap-2">
					<Thermometer class="text-muted-foreground h-4 w-4" />
					{#if loading}
						<Skeleton class="h-5 w-14" />
					{:else if latest}
						<span>{Math.round(latest.temperature!)}°C</span>
					{:else}
						<span class="text-muted-foreground text-sm">{$t('home.noData')}</span>
					{/if}
				</div>
				<div class="flex items-center gap-2">
					<Droplets class="text-muted-foreground h-4 w-4" />
					{#if loading}
						<Skeleton class="h-5 w-14" />
					{:else if latest}
						<span>{latest.humidity}%</span>
					{:else}
						<span class="text-muted-foreground text-sm">{$t('home.noData')}</span>
					{/if}
				</div>
				{#if latest}
					<div class="text-muted-foreground text-xs">
						{$t('home.lastUpdated')}: {latest.timestamp.format('MMM D, HH:mm')}
					</div>
				{/if}
			</div>
		</a>
	</li>
{/snippet}

<main class="flex w-screen flex-col items-center">
	{#if defaultStation && otherStations}
		<div
			class="mt-24 flex w-full max-w-4xl items-center {globalState.user
				? 'justify-between'
				: 'justify-center'}"
		>
			<h1 class="text-3xl font-medium">{$t('home.title')}</h1>
			{#if globalState.user}
				<Button onclick={() => openDialog()} variant="outline" size="sm">
					<Plus class="mr-2 h-4 w-4" />
					{$t('home.dialog.createStation.trigger')}
				</Button>
			{/if}
		</div>

		<div class="mt-10 w-full max-w-4xl">
			{@render card(defaultStation!)}
		</div>

		<ul class="my-10 flex w-full max-w-4xl flex-wrap justify-center gap-4">
			{#each otherStations as station}
				{@render card(station)}
			{/each}
		</ul>
	{/if}

	{#key selectedStation}
		<StationDialog bind:open={dialogOpen} station={selectedStation} />
	{/key}
</main>
