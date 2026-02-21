<script lang="ts">
	import StationDialog from '@/components/station/station-dialog.svelte';
	import { Input } from '@/components/ui/input';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Skeleton } from '@/components/ui/skeleton';
	import { Map } from '@/components/ui/map';
	import { api } from '@/shared';
	import { useLocalStorage, globalState } from '@/shared/runes.svelte';
	import type { Measurement, Station } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { CheckCircle2, Columns3, Droplets, Edit, Plus, Thermometer } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { t } from '@/translations';

	const stationsQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	let selectedStation: Station | undefined | null = $state();
	let dialogOpen = $state(false);
	let startInEditMode = $state(false);
	let latestMeasurements = $state<Record<number, Measurement | null>>({});
	let loadingMeasurements = $state<Record<number, boolean>>({});
	let search = $state('');

	const filteredStations = $derived(
		$stationsQuery.data?.results.filter((station) =>
			`${station.name.toLowerCase()} ${station.city_name.toLowerCase()}`.includes(
				search.toLowerCase()
			)
		) ?? []
	);

	const totalStations = $derived($stationsQuery.data?.results.length ?? 0);
	const avgTemperature = $derived(
		Object.values(latestMeasurements).length
			? Object.values(latestMeasurements)
					.filter(Boolean)
					.map((m) => m!.temperature)
					.reduce((a, b) => a + b, 0) / Object.values(latestMeasurements).filter(Boolean).length
			: null
	);

	$effect(() => {
		if ($stationsQuery.data?.results.length) {
			fetchAllLatestMeasurements();
		}
	});

	async function fetchAllLatestMeasurements() {
		if (!$stationsQuery.data?.results.length) return;

		try {
			for (const station of $stationsQuery.data.results) {
				try {
					loadingMeasurements[station.id] = true;
					const measurement = await api.getLatestMeasurement(station.id);
					measurement.timestamp = dayjs(measurement.timestamp);
					latestMeasurements[station.id] = measurement || null;
				} catch (error) {
					console.error(`Error fetching measurement for station ${station.id}:`, error);
					latestMeasurements[station.id] = null;
				} finally {
					loadingMeasurements[station.id] = false;
				}
			}
		} catch (error) {
			console.error('Error fetching measurements:', error);
		}
	}

	function openDialog(station?: Station, edit = false) {
		selectedStation = station;
		startInEditMode = edit;
		dialogOpen = true;
	}

	function setSelectedStation(stationId: number) {
		globalState.stationId = stationId;
		toast.success($t('menu.actions.selector.success'));
	}
</script>

{#snippet card(station: Station)}
	{@const latest = latestMeasurements[station.id]}
	{@const loading = loadingMeasurements[station.id]}
	{@const isSelected = globalState.stationId === station.id}
	<li
		class="group border-border hover:border-primary bg-card relative flex h-full w-full flex-col rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
	>
		{#if globalState.user}
			<div
				class="absolute top-4 right-4 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<Button
					variant={isSelected ? 'default' : 'ghost'}
					size="icon"
					class="size-8"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setSelectedStation(station.id);
					}}
					title={$t('dash.setDefault')}
				>
					<CheckCircle2 class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="size-8"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						openDialog(station, true);
					}}
				>
					<Edit class="h-4 w-4" />
				</Button>
			</div>
		{/if}

		<button
			class="flex h-full flex-col justify-between text-start"
			onclick={() => openDialog(station)}
		>
			<div class="mb-4 flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<span class="text-xl font-bold tracking-tight">{station.name}</span>
					{#if isSelected}
						<Badge variant="secondary" class="h-5 px-1.5 text-[10px] tracking-wider uppercase">
							{$t('dash.default')}
						</Badge>
					{/if}
				</div>
				<span class="text-muted-foreground text-sm font-medium">{station.city_name}</span>
			</div>

			{#if station.latitude && station.longitude}
				<div class="bg-muted/30 mb-4 w-full overflow-hidden rounded-lg border">
					<Map
						latitude={station.latitude}
						longitude={station.longitude}
						zoom={15}
						class="h-[120px]"
						preview={true}
					/>
				</div>
			{/if}

			<div>
				<div class="grid grid-cols-2 gap-4 border-t pt-4">
					<div class="flex items-center gap-3">
						<div class="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
							<Thermometer class="text-primary h-5 w-5" />
						</div>
						<div class="flex flex-col">
							<span class="text-muted-foreground text-[10px] font-bold tracking-tight uppercase"
								>{$t('dash.temperature')}</span
							>
							{#if loading}
								<Skeleton class="h-5 w-12" />
							{:else if latest}
								<span class="text-lg font-bold tabular-nums"
									>{Math.round(latest.temperature!)}°C</span
								>
							{:else}
								<span class="text-muted-foreground text-sm font-semibold">{$t('dash.noData')}</span>
							{/if}
						</div>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex size-9 items-center justify-center rounded-lg bg-cyan-500/10">
							<Droplets class="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
						</div>
						<div class="flex flex-col">
							<span class="text-muted-foreground text-[10px] font-bold tracking-tight uppercase"
								>{$t('dash.humidity')}</span
							>
							{#if loading}
								<Skeleton class="h-5 w-12" />
							{:else if latest}
								<span class="text-lg font-bold tabular-nums">{latest.humidity}%</span>
							{:else}
								<span class="text-muted-foreground text-sm font-semibold">{$t('dash.noData')}</span>
							{/if}
						</div>
					</div>
				</div>

				{#if latest}
					<div
						class="text-muted-foreground mt-4 flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase"
					>
						<div class="size-1 animate-pulse rounded-full bg-emerald-500"></div>
						{$t('dash.lastUpdated')}: {latest.timestamp.format('MMM D, HH:mm')}
					</div>
				{/if}
			</div>
		</button>
	</li>
{/snippet}

<svelte:head>
	<title>{$t('dash.pageTitle')}</title>
</svelte:head>

<main class="flex w-screen flex-col items-center px-4">
	{#if $stationsQuery.data?.results}
		<div class="mt-24 flex w-full max-w-4xl flex-col">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-2">
					<Columns3 class="text-primary h-6 w-6" />
					<h1 class="text-3xl font-medium">{$t('dash.title')}</h1>
				</div>
				<div
					class={[
						'flex w-full items-center gap-2',
						{
							'max-w-xs': globalState.user,
							'max-w-2xs': !globalState.user
						}
					]}
				>
					{#if globalState.station}
						<Input
							type="text"
							placeholder={$t('dash.searchPlaceholder')}
							bind:value={search}
							class="h-8"
						/>
					{/if}
					{#if globalState.user}
						<Button onclick={() => openDialog()} variant="outline" size="sm">
							<Plus class="mr-2 h-4 w-4" />
							{$t('dash.dialog.createStation.trigger')}
						</Button>
					{/if}
				</div>
			</div>

			<!-- Summary section -->
			<div class="mt-4 flex flex-wrap gap-4">
				<Badge>
					{$t('dash.totalStations')}: {totalStations}
				</Badge>
				{#if avgTemperature !== null}
					<Badge>
						{$t('dash.avgTemperature')}: {Math.round(avgTemperature)}°C
					</Badge>
				{/if}
			</div>
		</div>

		<div class="w-full max-w-4xl overflow-hidden rounded-md py-5">
			<Map stations={$stationsQuery.data?.results} {openDialog} preview={true} />
		</div>

		<!-- Catalogue view with sorted stations by temperature -->
		<div class="my-10 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
			{#if $stationsQuery.data?.results.length > 0 && filteredStations.length === 0}
				<div class="text-muted-foreground w-full py-10 text-center text-lg">
					{$t('dash.noStationsFound')}
				</div>
			{:else}
				{#each filteredStations as station}
					{@render card(station)}
				{/each}
			{/if}
		</div>
	{/if}

	{#key selectedStation}
		<StationDialog
			bind:open={dialogOpen}
			station={selectedStation ?? undefined}
			{startInEditMode}
		/>
	{/key}
</main>
