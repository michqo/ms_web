<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { getApi, getGlobalState } from '@/shared/runes.svelte';
	import {
		dayOptions,
		forecastOptions,
		invalidateWeather,
		latestOptions,
		stationsOptions,
		statsOptions
	} from '@/shared/queries';
	import { dailyCsv, readSelection } from '@/shared/weather';
	import { t } from '@/translations';
	import Observations from './Observations.svelte';
	import RangeControls from './RangeControls.svelte';
	import Trend from './Trend.svelte';
	import ForecastSection from './ForecastSection.svelte';
	import HistoryTable from './HistoryTable.svelte';
	import DayDetail from './DayDetail.svelte';
	import StationManager from './StationManager.svelte';
	import StationDialog from '@/components/station/station-dialog.svelte';
	import DeleteDialog from '@/components/measurements/delete-dialog.svelte';
	import Map from '@/components/ui/map/map.svelte';
	import { RefreshCw, ArrowUpRight, MapPin } from '@lucide/svelte';
	let { history = false }: { history?: boolean } = $props();
	const appState = getGlobalState();
	const api = getApi();
	const client = useQueryClient();
	const selection = $derived(readSelection(page.url.searchParams));
	const stations = createQuery(() => stationsOptions(api, appState));
	const latest = createQuery(() => ({
		...latestOptions(api, appState),
		enabled: latestOptions(api, appState).enabled && !history
	}));
	const stats = createQuery(() =>
		statsOptions(api, appState, selection.from, selection.to, !selection.error)
	);
	const intraday = createQuery(() =>
		dayOptions(api, appState, selection.from, selection.range === '1d' && !selection.error)
	);
	const forecast = createQuery(() => ({
		...forecastOptions(api, appState),
		enabled: forecastOptions(api, appState).enabled && !history
	}));
	const busy = $derived(
		stations.isFetching ||
			latest.isFetching ||
			stats.isFetching ||
			intraday.isFetching ||
			forecast.isFetching
	);
	const chartData = $derived(
		selection.range === '1d'
			? (intraday.data ?? []).map((d) => ({
					date: d.timestamp.toDate(),
					value: d[selection.metric]
				}))
			: (stats.data ?? []).map((d) => ({ date: d.date.toDate(), value: d[selection.metric] }))
	);
	const trendQuery = $derived(selection.range === '1d' ? intraday : stats);
	const ownStation = $derived(
		!appState.demo && !!appState.user && appState.station?.user === appState.user.id
	);
	let mapOpen = $state(false);
	let createOpen = $state(false);
	let deleteOpen = $state(false);
	let pendingUrl: URL | null = null;
	$effect(() => {
		appState.stationId;
		mapOpen = false;
		deleteOpen = false;
	});
	async function change(values: Record<string, string | null>) {
		// A second control can change before goto finishes. Merge with the intended URL.
		const url = new URL(pendingUrl ?? page.url);
		if (!pendingUrl && appState.station)
			url.searchParams.set('station', String(appState.station.id));
		for (const [key, value] of Object.entries(values)) {
			if (value === null) url.searchParams.delete(key);
			else url.searchParams.set(key, value);
		}
		pendingUrl = url;
		try {
			await goto(url, { noScroll: true, keepFocus: true });
		} finally {
			if (pendingUrl === url) pendingUrl = null;
		}
	}
	function selectStation(id: number) {
		change({ station: String(id), day: null });
	}
	function exportCsv() {
		if (!stats.data?.length || selection.error || stats.isError) return;
		const url = URL.createObjectURL(
			new Blob([dailyCsv(stats.data)], { type: 'text/csv;charset=utf-8' })
		);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `station-${appState.stationId}-daily-averages-${selection.from}-${selection.to}-UTC.csv`;
		anchor.click();
		URL.revokeObjectURL(url);
	}
	const historyUrl = $derived(
		`${appState.demo ? '/demo/measurements' : '/measurements'}?${page.url.searchParams.toString()}`
	);
</script>

<svelte:head
	><title
		>{history ? $t('weather.history') : $t('weather.overview')} · Weather Station · Miqal</title
	><meta name="description" content={$t('weather.pageDescription')} />{#if appState.demo}<meta
			name="robots"
			content="noindex"
		/>{/if}</svelte:head
>
<div class="weather-workspace">
	{#if appState.demo}<div class="demo-notice">
			<span class="sample-badge">{$t('weather.sample')}</span>
			<p>{$t('weather.sampleNotice')}</p>
			<a href="/dash">{$t('weather.exitDemo')}</a>
		</div>{/if}
	<div class="workspace-heading">
		<div>
			<p class="eyebrow">Weather Station</p>
			<h1>{history ? $t('weather.history') : $t('weather.overview')}</h1>
		</div>
		<button
			class="weather-button refresh-button"
			onclick={() => invalidateWeather(client, appState)}
			disabled={busy}
			><RefreshCw size={16} class={busy ? 'animate-spin' : ''} aria-hidden="true" />{$t(
				busy ? 'weather.refreshing' : 'weather.refresh'
			)}</button
		>
	</div>
	{#if stations.isPending}<p class="state-message" aria-live="polite">{$t('weather.loading')}</p>
	{:else if stations.isError && !stations.data}<div class="state-message" role="alert">
			<p>{$t('weather.stationsError')}</p>
			<button class="weather-button" onclick={() => stations.refetch()}
				>{$t('weather.retry')}</button
			>
		</div>
	{:else if !stations.data?.results.length}<div class="empty-workspace">
			<h2>{$t('weather.noStations')}</h2>
			<p>{appState.user ? $t('weather.noStationsHelp') : $t('weather.publicEmpty')}</p>
			{#if appState.user && !appState.demo}<button
					class="weather-button primary"
					onclick={() => (createOpen = true)}>{$t('weather.create')}</button
				>{:else}<a class="weather-button" href="/demo">{$t('weather.tryDemo')}</a>{/if}
		</div>
	{:else}
		<div class="station-toolbar">
			<label class="station-select"
				><span>{$t('weather.station')}</span><select
					aria-label={$t('weather.station')}
					value={appState.stationId}
					onchange={(e) => selectStation(Number(e.currentTarget.value))}
					>{#each stations.data.results as station}<option value={station.id}>{station.name}</option
						>{/each}</select
				></label
			><span class="station-city">{appState.station?.city_name}</span><StationManager
				stations={stations.data.results}
				onSelect={selectStation}
			/>
		</div>
		{#if stations.isError}<p class="weather-error" role="alert">
				{$t('weather.refreshError')}
			</p>{/if}
		{#if appState.station}
			{#if !history}<Observations
					reading={latest.data}
					pending={latest.isPending}
					error={latest.isError}
					demo={appState.demo}
					onRetry={() => latest.refetch()}
				/>{/if}
			<div class:overview-columns={!history}>
				<section class="measurements-section" aria-labelledby="trend-title">
					<div class="section-heading">
						<h2 id="trend-title">
							{history
								? $t(selection.range === '1d' ? 'weather.intraday' : 'weather.dailyMean')
								: $t('weather.trend')}
						</h2>
						{#if !history}<a class="text-link" href={historyUrl}
								>{$t('weather.explore')}<ArrowUpRight size={16} aria-hidden="true" /></a
							>{/if}
					</div>
					<RangeControls
						range={selection.range}
						from={selection.from}
						to={selection.to}
						metric={selection.metric}
						error={selection.error}
						onChange={change}
					/>
					<Trend
						data={chartData}
						metric={selection.metric}
						intraday={selection.range === '1d'}
						pending={trendQuery.isPending}
						error={trendQuery.isError}
						invalid={selection.error}
						onRetry={() => trendQuery.refetch()}
					/>
					{#if history && !selection.error}
						<div class="history-actions">
							<button
								class="weather-button"
								disabled={!stats.data?.length || stats.isError || stats.isFetching}
								onclick={exportCsv}>{$t('weather.export')}</button
							>{#if selection.range === '1d' && intraday.data?.length}<button
									class="weather-button"
									onclick={() => change({ day: selection.from })}>{$t('weather.openDay')}</button
								>{/if}{#if ownStation}<button
									class="weather-button danger"
									disabled={stats.isPending}
									onclick={() => (deleteOpen = true)}>{$t('weather.deleteReadings')}</button
								>{/if}
						</div>
						<p class="muted csv-scope">{$t('weather.csvScope')}</p>
						{#if stats.data?.length}<HistoryTable
								rows={stats.data}
								onSelect={(day) => change({ day })}
							/>{/if}
					{/if}
					<p class="timezone-note">{$t('weather.timezone')}</p>
				</section>
				{#if !history}<ForecastSection
						data={forecast.data}
						pending={forecast.isPending}
						error={forecast.isError}
						onRetry={() => forecast.refetch()}
					/>{/if}
			</div>
			<section class="station-location">
				<div>
					<h2><MapPin size={16} aria-hidden="true" />{$t('weather.location')}</h2>
					<p>
						{appState.station.name}{appState.station.city_name &&
						appState.station.city_name !== appState.station.name
							? ` · ${appState.station.city_name}`
							: ''} · {appState.station.latitude.toFixed(4)}, {appState.station.longitude.toFixed(
							4
						)}
					</p>
				</div>
				<button class="weather-button" aria-expanded={mapOpen} onclick={() => (mapOpen = !mapOpen)}
					>{$t('weather.showLocation')}</button
				>{#if mapOpen}<div class="location-map">
						{#key appState.stationId}<Map
								latitude={appState.station.latitude}
								longitude={appState.station.longitude}
								preview
								zoom={12}
							/>{/key}
					</div>{/if}
			</section>
			<DayDetail
				day={!selection.error ? selection.day : null}
				metric={selection.metric}
				onClose={() => change({ day: null })}
			/>
			{#if deleteOpen}<DeleteDialog
					bind:open={deleteOpen}
					stationId={appState.stationId}
					from={selection.from}
					to={selection.to}
				/>{/if}
		{/if}
	{/if}
	{#if createOpen}<StationDialog bind:open={createOpen} />{/if}
</div>
