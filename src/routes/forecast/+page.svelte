<script lang="ts">
	import Card from '@/components/forecast/card.svelte';
	import Table from '@/components/forecast/table.svelte';
	import { api, transformForecast } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { t } from '@/translations';

	const dataQuery = $derived(
		createQuery({
			queryKey: ['forecast', globalState.stationId],
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
		<div class="border-border/50 bg-card mt-24 w-full max-w-2xl rounded-lg border p-6">
			<p class="text-sm font-semibold">{$t('forecast.status.no_station')}</p>
			<p class="text-muted-foreground mt-1 text-xs">{$t('forecast.status.no_station_hint')}</p>
		</div>
	{:else if $dataQuery.isPending}
		<div class="mt-24 w-full max-w-2xl space-y-4">
			<div class="bg-muted h-10 w-2/3 animate-pulse rounded"></div>
			<div class="bg-muted h-44 w-full animate-pulse rounded"></div>
			<div class="bg-muted h-40 w-full animate-pulse rounded"></div>
		</div>
	{:else if $dataQuery.isError}
		<div class="border-border/50 bg-card mt-24 w-full max-w-2xl rounded-lg border p-6">
			<p class="text-sm font-semibold">{$t('forecast.status.api_unavailable')}</p>
			<p class="text-muted-foreground mt-1 text-xs">{$t('forecast.status.api_unavailable_hint')}</p>
		</div>
	{:else if $dataQuery.data && $dataQuery.data.results.length === 0}
		<div class="border-border/50 bg-card mt-24 w-full max-w-2xl rounded-lg border p-6">
			<p class="text-sm font-semibold">{$t('forecast.status.no_data')}</p>
			<p class="text-muted-foreground mt-1 text-xs">{$t('forecast.status.no_data_hint')}</p>
		</div>
	{:else if $dataQuery.data}
		{@const forecast = $dataQuery.data}
		<div class="mt-20 mb-6 flex w-full max-w-2xl items-center gap-3">
			<span class="text-foreground font-mono text-xs font-semibold tracking-widest uppercase">
				{globalState.station?.name}
			</span>
			<div class="bg-border h-px flex-1"></div>
			<span class="text-muted-foreground font-mono text-xs">{globalState.station?.city_name}</span>
		</div>

		<div class="flex w-full max-w-2xl flex-col gap-y-6">
			<Card forecast={forecast.results[0]} stationId={globalState.stationId} />
			<Table forecast={forecast.results} updatedDate={forecast.created_at} />
		</div>
	{/if}
</main>
