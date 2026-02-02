<script lang="ts">
	import Card from '@/components/forecast/card.svelte';
	import Table from '@/components/forecast/table.svelte';
	import { Map } from '@/components/ui/map';
	import { api, transformForecast } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { t } from '@/translations';

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

<svelte:head>
	<title>{$t('forecast.pageTitle')}</title>
</svelte:head>

<main class="grid h-svh place-items-center p-4">
	{#if $dataQuery.data}
		{@const forecast = $dataQuery.data}
		<div class="mb-6 flex w-full flex-col items-center">
			<h1 class="text-4xl font-medium">{globalState.station?.name}</h1>
			<h2 class="text-muted-foreground mt-1 text-xl font-light">
				{globalState.station?.city_name}
			</h2>
			<!-- Preview map -->
			{#if forecast.latitude && forecast.longitude}
				<div class="mt-2 w-full max-w-lg overflow-hidden rounded-lg shadow-md">
					<Map
						latitude={forecast.latitude}
						longitude={forecast.longitude}
						zoom={14}
						class="h-[150px]"
						preview={true}
					/>
				</div>
			{/if}
		</div>

		<div class="mt-5 flex w-full max-w-sm flex-col items-center gap-y-8">
			<Card forecast={forecast.results[0]} stationId={globalState.stationId} />
			<Table forecast={forecast.results} updatedDate={forecast.created_at} />
		</div>
	{/if}
</main>
