<script lang="ts">
	import StationDialog from '@/components/station/station-dialog.svelte';
	import { Button } from '@/components/ui/button';
	import { api } from '@/shared';
	import type { Station } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import { Edit } from 'lucide-svelte';

	const dataQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	let selectedStation = $state();
	let dialogOpen = $state(false);

	function openDialog(station: Partial<Station>) {
		selectedStation = station;
		dialogOpen = true;
	}
</script>

<main class="flex w-screen flex-col items-center">
	{#if $dataQuery.data}
		{@const stations = $dataQuery.data.results}
		<h1 class="mt-24 text-3xl font-medium">Stations</h1>
		<ul class="mt-10 flex w-full max-w-xs flex-col items-center gap-y-4">
			{#each stations as station}
				<li
					class="group relative flex w-full flex-col rounded-lg border border-border px-8 py-4 shadow-lg hover:border-primary"
				>
					<div class="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
						<Button variant="ghost" size="icon" onclick={() => openDialog(station)}>
							<Edit class="h-4 w-4" />
						</Button>
					</div>
					<a href="/measurements?station={station.id}" class="flex flex-col">
						<span>{station.name}</span>
						<span class="text-muted-foreground">{station.city_name}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}

	{#if selectedStation}
		<StationDialog
			bind:open={dialogOpen}
			station={selectedStation}
		/>
	{/if}
</main>
