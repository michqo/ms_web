<script lang="ts">
	import Card from '@/components/forecast/card.svelte';
	import Table from '@/components/forecast/table.svelte';
	import { Map } from '@/components/ui/map';
	import { api, transformForecast } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { t } from '@/translations';
	import { Cloud } from 'lucide-svelte';

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

<main class="flex min-h-screen flex-col items-center p-4">
	{#if !globalState.stationId}
		<div
			class="mt-24 w-full max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
		>
			<p class="text-base font-semibold">{$t('forecast.status.no_station')}</p>
			<p class="mt-1 text-sm">{$t('forecast.status.no_station_hint')}</p>
		</div>
	{:else if $dataQuery.isPending}
		<div class="mt-24 w-full max-w-2xl space-y-4">
			<div class="bg-muted h-10 w-2/3 animate-pulse rounded"></div>
			<div class="bg-muted h-44 w-full animate-pulse rounded"></div>
			<div class="bg-muted h-40 w-full animate-pulse rounded"></div>
		</div>
	{:else if $dataQuery.isError}
		<div
			class="mt-24 w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
		>
			<p class="text-base font-semibold">{$t('forecast.status.api_unavailable')}</p>
			<p class="mt-1 text-sm">{$t('forecast.status.api_unavailable_hint')}</p>
		</div>
	{:else if $dataQuery.data && $dataQuery.data.results.length === 0}
		<div
			class="mt-24 w-full max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
		>
			<p class="text-base font-semibold">{$t('forecast.status.no_data')}</p>
			<p class="mt-1 text-sm">{$t('forecast.status.no_data_hint')}</p>
		</div>
	{:else if $dataQuery.data}
		{@const forecast = $dataQuery.data}
		<div class="mt-4 mb-6 flex w-full flex-col items-center">
			<div class="flex items-center gap-2">
				<Cloud class="text-primary h-8 w-8" />
				<h1 class="text-3xl font-bold sm:text-4xl">{globalState.station?.name}</h1>
			</div>
			<h2 class="text-muted-foreground mt-1 text-lg font-light sm:text-xl">
				{globalState.station?.city_name}
			</h2>
			<!-- Preview map -->
			{#if forecast.latitude && forecast.longitude}
				<div
					class="border-border mt-4 w-full max-w-2xl overflow-hidden rounded-xl border shadow-sm"
				>
					<Map
						latitude={forecast.latitude}
						longitude={forecast.longitude}
						zoom={14}
						class="h-[150px] sm:h-[200px]"
						preview={true}
					/>
				</div>
			{/if}
		</div>

		<div class="mt-4 flex w-full max-w-2xl flex-col items-stretch gap-y-6 sm:mt-6 sm:gap-y-10">
			<Card forecast={forecast.results[0]} stationId={globalState.stationId} />
			<Table forecast={forecast.results} updatedDate={forecast.created_at} />
		</div>
	{/if}
</main>
