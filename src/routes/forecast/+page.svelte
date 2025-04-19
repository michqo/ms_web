<script lang="ts">
	import Card from '@/components/forecast/card.svelte';
	import Table from '@/components/forecast/table.svelte';
	import { api, transformForecast } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';

	const dataQuery = $derived(
		createQuery({
			queryKey: ['forecast'],
			queryFn: () => api.getForecast(globalState.station?.id!),
			enabled: !!globalState.stationId,
			select: (data) => ({
				id: data.id,
				latitude: data.latitude,
				longitude: data.longitude,
				city_name: data.city_name,
				modelrun_utc: data.modelrun_utc,
				utc_timeoffset: data.utc_timeoffset,
				generation_time_ms: data.generation_time_ms,
				created_at: dayjs(data.created_at),
				results: transformForecast(data)
			})
		})
	);
</script>

<main class="grid h-svh place-items-center">
	{#if $dataQuery.data}
		{@const forecast = $dataQuery.data}
		<div class="my-6 flex flex-col items-center">
			<h1 class="text-4xl font-medium">{globalState.station?.name}</h1>
			<h2 class="text-muted-foreground mt-1 text-xl font-light">
				{globalState.station?.city_name}
			</h2>
		</div>

		<div class="flex w-full max-w-sm flex-col items-center gap-y-8">
			<Card forecast={forecast.results[0]} stationId={globalState.stationId} />
			<Table forecast={forecast.results} updatedDate={forecast.created_at} />
		</div>
	{/if}
</main>
