<script lang="ts">
	import StationDialog from '@/components/station/station-dialog.svelte';
	import { Button } from '@/components/ui/button';
	import { api } from '@/shared';
	import type { Station } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import { Edit, Plus } from 'lucide-svelte';

	const dataQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	let selectedStation: Partial<Station> | undefined = $state();
	let dialogOpen = $state(false);

	function openDialog(station?: Partial<Station>) {
		selectedStation = station || undefined;
		dialogOpen = true;
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

  {#key selectedStation}
    <StationDialog bind:open={dialogOpen} station={selectedStation} />
  {/key}
</main>
