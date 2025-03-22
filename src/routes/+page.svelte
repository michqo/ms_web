<script lang="ts">
	import StationDialog from '@/components/station/station-dialog.svelte';
	import { Button } from '@/components/ui/button';
	import { api } from '@/shared';
	import useLocalStorage from '@/shared/runes.svelte';
	import type { Station } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import { CheckCircle2, Edit, Plus } from 'lucide-svelte';
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
		<div class="mt-24 flex w-full max-w-xs items-center justify-between">
			<h1 class="text-3xl font-medium">Stations</h1>
			<Button onclick={() => openDialog()} variant="outline" size="sm">
				<Plus class="mr-2 h-4 w-4" />
				Add
			</Button>
		</div>

		<ul class="mt-10 flex w-full max-w-xs flex-col items-center gap-y-4">
			{#each stations as station}
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
					</a>
				</li>
			{/each}
		</ul>
	{/if}

	{#key selectedStation}
		<StationDialog bind:open={dialogOpen} station={selectedStation} />
	{/key}
</main>
