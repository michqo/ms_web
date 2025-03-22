<script lang="ts">
	import { page } from "$app/state";
	import Card from '@/components/forecast/card.svelte';
	import Table from '@/components/forecast/table.svelte';
	import { api, transformForecast } from "@/shared";
	import useLocalStorage from "@/shared/runes.svelte";
	import { createQuery } from "@tanstack/svelte-query";
	import { toast } from "svelte-sonner";

  const stationsQuery = createQuery({
    queryKey: ['stations'],
    queryFn: () => api.getStations(),
  });

  const defaultStationId = useLocalStorage('defaultStationId', undefined);
	const stationIdParam = $derived(page.params.station);
	const stationId = $derived(
		stationIdParam ? parseInt(stationIdParam) : parseInt(defaultStationId.value)
	);
  const defaultStation = $derived(
    $stationsQuery.data?.results.find((station) => station.id === stationId)
  );

	$effect(() => {
		// If stations are loaded and no station is selected, select the first one
		if ($stationsQuery.data?.results.length && !defaultStationId.value) {
			const firstStation = $stationsQuery.data.results[0];
			setSelectedStation(firstStation.id);
		}
	});

  const dataQuery = $derived(createQuery({
    queryKey: ['forecast'],
    queryFn: () => api.getForecast(defaultStation?.id!),
    enabled: !!defaultStation,
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
  }));

  function setSelectedStation(id: number) {
		defaultStationId.value = id.toString();
		toast.success('Station selected as default');
	}
</script>

<main class="grid h-svh place-items-center">
  {#if $dataQuery.data}
    {@const forecast = $dataQuery.data}
    <div class="flex flex-col items-center my-6">
      <h1 class="font-medium text-4xl">{defaultStation?.name}</h1>
      <h2 class="text-xl font-light text-muted-foreground mt-1">{defaultStation?.city_name}</h2>
    </div>

    <div class="flex flex-col items-center gap-y-8 w-full max-w-sm">
      <Card forecast={forecast.results[0]} stationId={defaultStation?.id!}/>
      <Table forecast={forecast.results} updatedDate={forecast.modelrun_utc} />
    </div>
  {/if}
</main>
