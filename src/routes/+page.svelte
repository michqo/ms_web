<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '@/shared';

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
      <a href="/measurements?station={station.id}">
        <li class="flex flex-col px-8 py-4 rounded-lg border border-border shadow-lg hover:border-primary">
          <span>{station.name}</span>
          <span class="text-muted-foreground">{station.latitude}</span>
          <span class="text-muted-foreground">{station.longitude}</span>
        </li>
      </a>
      {/each}
    </ul>
  {/if}
</main>
