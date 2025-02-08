<script lang="ts">
	import { api, transformForecast } from "@/shared/api";
	import { createQuery } from "@tanstack/svelte-query";
  import ForecastTable from '@/components/forecast/table.svelte';

  const dataQuery = createQuery({
    queryKey: ['forecast'],
    queryFn: () => api.getForecast(),
    select: transformForecast
  })
</script>

<main class="grid h-svh place-items-center">
  {#if $dataQuery.data}
    <div class="flex w-full max-w-xs">
      <ForecastTable forecast={$dataQuery.data} />
    </div>
  {/if}
</main>
