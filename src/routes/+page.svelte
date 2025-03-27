<script lang="ts">
	import StationDialog from '@/components/station/station-dialog.svelte';
	import { Button } from '@/components/ui/button';
	import { Skeleton } from '@/components/ui/skeleton';
	import { api } from '@/shared';
	import useLocalStorage from '@/shared/runes.svelte';
	import type { Measurement, Station } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { CheckCircle2, Droplets, Edit, Plus, Thermometer } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	const dataQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	let selectedStation: Partial<Station> | undefined = $state();
	let dialogOpen = $state(false);
	const defaultStationId = useLocalStorage('defaultStationId', undefined);

	$effect(() => {
		// If stations are loaded and no station is selected, select the first one
		if ($dataQuery.data?.results.length && defaultStationId === null) {
			const firstStation = $dataQuery.data.results[0];
			setSelectedStation(firstStation.id);
		}
	});

	let latestMeasurements = $state<Record<number, Measurement | null>>({});
	let loadingMeasurements = $state<Record<number, boolean>>({});

	$effect(() => {
		// When stations load, fetch measurements for all stations
		if ($dataQuery.data?.results.length) {
			fetchAllLatestMeasurements();
		}
	});

	async function fetchAllLatestMeasurements() {
		if (!$dataQuery.data?.results.length) return;

		try {
			for (const station of $dataQuery.data.results) {
				try {
					loadingMeasurements[station.id] = true;
					const measurement = await api.getLatestMeasurement(station.id);
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
		localStorage.setItem('selectedStationId', stationId.toString());
		toast.success('Station selected as default');
	}
</script>

<main class="flex w-screen flex-col items-center">
	{#if $dataQuery.data}
		{@const stations = $dataQuery.data.results}
		<div class="mt-24 flex w-full max-w-md items-center justify-between">
			<h1 class="text-3xl font-medium">Stations</h1>
			<Button onclick={() => openDialog()} variant="outline" size="sm">
				<Plus class="mr-2 h-4 w-4" />
				Add
			</Button>
		</div>

		<ul class="mt-10 flex w-full max-w-md flex-col items-center gap-y-4">
			{#each stations as station}
				{@const latest = latestMeasurements[station.id]}
				{@const loading = loadingMeasurements[station.id]}
				<li
					class="group relative flex w-full flex-col rounded-lg border {defaultStationId.value ==
					station.id.toString()
						? 'border-primary bg-muted/30'
						: 'border-border'} px-8 py-4 shadow-lg hover:border-primary"
				>
					<div
						class="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<Button
							variant={defaultStationId.value == station.id.toString() ? 'default' : 'ghost'}
							size="icon"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setSelectedStation(station.id);
							}}
							title="Set as default station"
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
					<a href="/measurements?station={station.id}" class="flex flex-col">
						<div class="flex items-center gap-2">
							<span>{station.name}</span>
							{#if defaultStationId.value == station.id.toString()}
								<span class="text-xs text-muted-foreground">(Default)</span>
							{/if}
						</div>
						<span class="text-muted-foreground">{station.city_name}</span>

						<div class="mt-3 grid grid-cols-2 gap-2 border-t pt-2">
							<div class="flex items-center gap-2">
								<Thermometer class="h-4 w-4 text-muted-foreground" />
								{#if loading}
									<Skeleton class="h-5 w-14" />
								{:else if latest}
									<span>{Math.round(latest.temperature!)}°C</span>
								{:else}
									<span class="text-sm text-muted-foreground">No data</span>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<Droplets class="h-4 w-4 text-muted-foreground" />
								{#if loading}
									<Skeleton class="h-5 w-14" />
								{:else if latest}
									<span>{latest.humidity}%</span>
								{:else}
									<span class="text-sm text-muted-foreground">No data</span>
								{/if}
							</div>
							{#if latest}
								<div class="text-xs text-muted-foreground">
									Last updated: {dayjs(latest.timestamp).format('MMM D, HH:mm')}
								</div>
							{/if}
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}

	{#key selectedStation}
		<StationDialog bind:open={dialogOpen} station={selectedStation} />
	{/key}
</main>
