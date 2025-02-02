<script lang="ts">
	import { api, transformForecast } from "@/shared/api";
	import { createQuery } from "@tanstack/svelte-query";
  import ForecastCard from '@/components/forecast/card.svelte';

  const dataQuery = createQuery({
    queryKey: ['forecast'],
    queryFn: () => api.getForecast(),
    select: transformForecast
  })
</script>

<main class="grid h-svh items-center justify-center">
  {#if $dataQuery.data}
    <div class="grid w-full gap-4 grid-cols-7">
      {#each $dataQuery.data as item}
        <ForecastCard forecast={item} />
      {/each}
    </div>
  {/if}
</main>
