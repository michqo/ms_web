<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
  import Table from '@/components/forecast/table.svelte';
  import Card from '@/components/forecast/card.svelte';
	import dayjs from "dayjs";
	import { api, transformForecast } from "@/shared";

  const stationsQuery = createQuery({
    queryKey: ['stations'],
    queryFn: () => api.getStations(),
  });
  
  const dataQuery = createQuery({
    queryKey: ['forecast'],
    queryFn: () => api.getForecast($stationsQuery.data?.results[0].id!),
    enabled: $stationsQuery.isSuccess,
    select: (data) => ({
      id: data.id,
      latitude: data.latitude,
      longitude: data.longitude,
      city_name: data.city_name,
      modelrun_utc: data.modelrun_utc,
      utc_timeoffset: data.utc_timeoffset,
      generation_time_ms: data.generation_time_ms,
      results: transformForecast(data),
    })
  })
</script>

<main class="grid h-svh place-items-center">
  {#if $dataQuery.data}
    {@const forecast = $dataQuery.data}
    <h1 class="font-medium text-3xl">{forecast.city_name}</h1>

    <div class="flex flex-col items-center gap-y-4 w-full max-w-xs">
      <Card forecast={forecast.results[0]} />
      <Table forecast={forecast.results} />
      <p class="text-muted-foreground">Updated at: {dayjs(forecast.modelrun_utc).format("HH:mm")}</p>
    </div>
  {/if}
</main>
