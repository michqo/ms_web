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

  const currentStation = $stationsQuery.data?.results[0];
  
  const dataQuery = createQuery({
    queryKey: ['forecast'],
    queryFn: () => api.getForecast(currentStation?.id!),
    enabled: currentStation != undefined,
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
    <div class="flex flex-col items-center my-6">
      <h1 class="font-medium text-4xl">{currentStation?.name}</h1>
      <h2 class="text-xl font-light text-muted-foreground mt-1">{currentStation?.city_name}</h2>
    </div>

    <div class="flex flex-col items-center gap-y-8 w-full max-w-sm">
      <Card forecast={forecast.results[0]} stationId={currentStation?.id!}/>
      <Table forecast={forecast.results} updatedDate={forecast.modelrun_utc} />
    </div>
  {/if}
</main>
