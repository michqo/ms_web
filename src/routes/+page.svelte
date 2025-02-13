<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '@/shared/api';

  const dataQuery = createQuery({
    queryKey: ['stations'],
    queryFn: () => api.getStations(),
  });
</script>

<main class="flex flex-col w-screen items-center">
  {#if $dataQuery.data}
    {@const stations = $dataQuery.data.results}
    <h1 class="font-medium text-3xl mt-24">Stations</h1>
    <ul class="mt-10 flex flex-col items-center gap-y-4 w-full max-w-xs">
      {#each stations as station}
        <li class="flex flex-col px-8 py-4 rounded-lg border border-border shadow-lg">
          <span>{station.name}</span>
          <span class="text-muted-foreground">({station.id})</span>
        </li>
      {/each}
    </ul>
  {/if}
</main>
