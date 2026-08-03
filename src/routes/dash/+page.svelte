<script lang="ts">
	import { Map } from '@/components/ui/map';
	import { Button } from '@/components/ui/button';
	import { Skeleton } from '@/components/ui/skeleton';
	import ForecastCard from '@/components/forecast/card.svelte';
	import ForecastTable from '@/components/forecast/table.svelte';
	import StatsChart from '@/components/measurements/stats-chart.svelte';
	import StationDialog from '@/components/station/station-dialog.svelte';
	import { Input } from '@/components/ui/input';
	import * as Dialog from '@/components/ui/dialog';
	import { api, transformForecast } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import type { Station } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import {
		AlertCircle,
		ChartLine,
		CheckCircle2,
		CloudRain,
		CloudSun,
		Droplets,
		Edit,
		Gauge,
		MapPin,
		Plus,
		Sun,
		Thermometer,
		Wind,
		X
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import { buttonVariants } from '@/components/ui/button';

	const stationsQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	let rangeDays = $state<'1d' | '7d' | '30d' | 'custom'>('7d');
	let customFrom = $state<dayjs.Dayjs>(dayjs().subtract(7, 'day').startOf('day'));
	let customTo = $state<dayjs.Dayjs>(dayjs());

	const dateFrom = $derived(
		rangeDays === '1d'
			? dayjs().startOf('day')
			: rangeDays === '7d'
				? dayjs().subtract(7, 'day').startOf('day')
				: rangeDays === '30d'
					? dayjs().subtract(30, 'day').startOf('day')
					: customFrom.startOf('day')
	);

	const dateTo = $derived(rangeDays === 'custom' ? customTo : dayjs());

	const latestMeasurementQuery = $derived(
		createQuery({
			queryKey: ['latestMeasurement', globalState.stationId],
			queryFn: () => api.getLatestMeasurement(globalState.stationId!),
			enabled: !!globalState.stationId,
			staleTime: 60_000
		})
	);

	const measurementStatsQuery = $derived(
		createQuery({
			queryKey: [
				'measurementStats',
				globalState.stationId,
				dateFrom.toISOString(),
				dateTo.toISOString()
			],
			queryFn: () =>
				api.getMeasurementStats(
					globalState.stationId!,
					dateFrom.toISOString(),
					dateTo.toISOString()
				),
			enabled: !!globalState.stationId
		})
	);

	const forecastQuery = $derived(
		createQuery({
			queryKey: ['forecast', globalState.stationId],
			queryFn: () => api.getForecast(globalState.stationId!),
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

	const currentStation = $derived(
		$stationsQuery.data?.results?.find((s) => s.id === globalState.stationId) ?? null
	);

	const latestMeasurement = $derived($latestMeasurementQuery.data ?? null);

	const onlineStatus = $derived.by(() => {
		if (!latestMeasurement) return { color: 'gray', text: $t('dash.status.noData'), pulse: false };
		const minutes = dayjs().diff(latestMeasurement.timestamp, 'minute');
		if (minutes < 5)
			return { color: 'emerald', text: $t('dash.status.updatedJustNow'), pulse: true };
		if (minutes < 30)
			return {
				color: 'emerald',
				text: $t('dash.status.updatedAgo', { n: `${minutes}m` } as any),
				pulse: false
			};
		if (minutes < 120)
			return {
				color: 'amber',
				text: $t('dash.status.updatedAgo', { n: `${Math.floor(minutes / 60)}h` } as any),
				pulse: false
			};
		if (minutes < 1440)
			return {
				color: 'orange',
				text: $t('dash.status.lastSeenAgo', { n: `${Math.floor(minutes / 60)}h` } as any),
				pulse: false
			};
		return {
			color: 'red',
			text: $t('dash.status.lastSeenAgo', { n: `${Math.floor(minutes / 1440)}d` } as any),
			pulse: false
		};
	});

	let viewAllOpen = $state(false);
	let createStationOpen = $state(false);
	let searchTerm = $state('');
	let selectedStation: Station | undefined = $state();
	let editMode = $state(false);

	let dotColorClass = $derived(
		onlineStatus.color === 'emerald'
			? 'bg-emerald-500'
			: onlineStatus.color === 'amber'
				? 'bg-amber-500'
				: onlineStatus.color === 'orange'
					? 'bg-orange-500'
					: onlineStatus.color === 'red'
						? 'bg-red-500'
						: 'bg-gray-500'
	);

	const rangePresets = $derived.by(() => [
		{ value: '1d' as const, label: $t('dash.range1d') },
		{ value: '7d' as const, label: $t('dash.range7d') },
		{ value: '30d' as const, label: $t('dash.range30d') },
		{ value: 'custom' as const, label: $t('dash.rangeCustom') }
	]);

	const hasStation = $derived(!!globalState.stationId);

	$effect(() => {
		if (!createStationOpen) {
			selectedStation = undefined;
			editMode = false;
		}
	});

	function setSelectedStation(stationId: number) {
		globalState.stationId = stationId;
		viewAllOpen = false;
		toast.success($t('menu.actions.selector.success'));
	}

	function openEditStation(station: Station) {
		selectedStation = station;
		editMode = true;
		viewAllOpen = false;
		createStationOpen = true;
	}

	$effect(() => {
		if (!createStationOpen) {
			editMode = false;
			selectedStation = undefined;
		}
	});
</script>

<svelte:head>
	<title>{$t('dash.pageTitle')}</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center px-4 pb-20">
	{#if !hasStation}
		<div class="mt-32 flex w-full max-w-md flex-col items-center gap-4 text-center">
			<CloudSun class="text-muted-foreground size-16" />
			<h2 class="text-xl font-bold">{$t('dash.noStationTitle')}</h2>
			<p class="text-muted-foreground text-sm">{$t('dash.noStationHint')}</p>
			<Button variant="default" onclick={() => (viewAllOpen = true)}>
				{$t('dash.selectStation')}
			</Button>
			{#if globalState.user}
				<Button variant="outline" onclick={() => (createStationOpen = true)}>
					<Plus class="mr-1 size-4" />
					{$t('dash.dialog.createStation.trigger')}
				</Button>
			{/if}
		</div>
	{:else if $latestMeasurementQuery.isPending && $measurementStatsQuery.isPending && $forecastQuery.isPending}
		<div class="mt-20 w-full max-w-5xl">
			<Skeleton class="mb-6 h-8 w-64" />
			<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
				<Skeleton class="h-64 rounded-xl" />
				<Skeleton class="h-64 rounded-xl" />
				<Skeleton class="h-48 rounded-xl" />
				<Skeleton class="h-48 rounded-xl" />
			</div>
			<Skeleton class="mt-5 h-40 rounded-xl" />
		</div>
	{:else}
		<div class="mt-20 flex w-full max-w-5xl flex-col gap-6">
			<!-- Station Header — Task 2 -->
			<div class="flex flex-wrap items-center justify-between gap-3">
				{#if currentStation}
					<div class="flex items-center gap-3">
						<h1 class="text-2xl font-bold tracking-tight">{currentStation.name}</h1>
						<span class="text-muted-foreground text-sm">{currentStation.city_name}</span>
					</div>
					<div class="text-muted-foreground flex items-center gap-1.5 font-mono text-xs">
						<div
							class={cn(
								'size-2 rounded-full',
								dotColorClass,
								onlineStatus.pulse && 'animate-pulse'
							)}
						></div>
						<span>{onlineStatus.text}</span>
					</div>
				{:else}
					<Skeleton class="h-8 w-64" />
				{/if}
			</div>

			<!-- Widget grid -->
			<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
				<!-- Current Conditions — Task 3 -->
				<div class="border-border/60 bg-card rounded-xl border p-6 shadow-xs sm:p-7">
					<div class="mb-5 flex items-center gap-2.5">
						<Thermometer class="text-primary size-5" />
						<h3 class="text-sm font-semibold">{$t('dash.currentConditions')}</h3>
					</div>

					{#if $latestMeasurementQuery.isPending}
						<div class="space-y-4">
							<Skeleton class="h-16 w-32" />
							<div class="grid grid-cols-3 gap-3">
								{#each Array(6) as _}
									<Skeleton class="h-14 rounded-lg" />
								{/each}
							</div>
						</div>
					{:else if $latestMeasurementQuery.isError}
						<div class="flex flex-1 flex-col items-center justify-center gap-3 py-6">
							<p class="text-muted-foreground text-sm">{$t('dash.status.apiUnavailable')}</p>
							<Button variant="outline" size="xs" onclick={() => $latestMeasurementQuery.refetch()}>
								{$t('dash.status.retry')}
							</Button>
						</div>
					{:else if latestMeasurement}
						{@const m = latestMeasurement}
						<div class="flex flex-1 flex-col justify-center">
							<span class="text-5xl font-bold tracking-tight">{m.temperature.toFixed(1)}°C</span>
							<div class="text-muted-foreground mt-1 font-mono text-xs">
								{$t('dash.lastUpdatedAt')}
								{m.timestamp.format('HH:mm')}
							</div>
							<div class="mt-6 grid grid-cols-3 gap-3">
								<div class="bg-muted/50 flex flex-col items-center gap-1 rounded-lg p-2.5">
									<Droplets class="size-4 text-cyan-500" />
									<span class="text-xs font-semibold tabular-nums">{m.humidity}%</span>
									<span class="text-muted-foreground text-[10px]">{$t('dash.humidity')}</span>
								</div>
								<div class="bg-muted/50 flex flex-col items-center gap-1 rounded-lg p-2.5">
									<Gauge class="size-4 text-slate-500" />
									<span class="text-xs font-semibold tabular-nums">{m.pressure} hPa</span>
									<span class="text-muted-foreground text-[10px]">{$t('dash.pressure')}</span>
								</div>
								<div class="bg-muted/50 flex flex-col items-center gap-1 rounded-lg p-2.5">
									<Wind class="size-4 text-sky-500" />
									<span class="text-xs font-semibold tabular-nums">{m.wind_speed} m/s</span>
									<span class="text-muted-foreground text-[10px]">{$t('dash.wind')}</span>
								</div>
								<div class="bg-muted/50 flex flex-col items-center gap-1 rounded-lg p-2.5">
									<CloudRain class="size-4 text-blue-500" />
									<span class="text-xs font-semibold tabular-nums">{m.rain} mm</span>
									<span class="text-muted-foreground text-[10px]">{$t('dash.rain')}</span>
								</div>
								<div class="bg-muted/50 flex flex-col items-center gap-1 rounded-lg p-2.5">
									<Sun class="size-4 text-amber-500" />
									<span class="text-xs font-semibold tabular-nums"
										>{(m as any).uv_index ?? '\u2014'}</span
									>
									<span class="text-muted-foreground text-[10px]">{$t('dash.uv')}</span>
								</div>
								<div class="bg-muted/50 flex flex-col items-center gap-1 rounded-lg p-2.5">
									<MapPin class="size-4 text-emerald-500" />
									<span class="text-xs font-semibold tabular-nums">{m.wind_direction}°</span>
									<span class="text-muted-foreground text-[10px]">{$t('dash.windDirection')}</span>
								</div>
							</div>
						</div>
					{:else}
						<div class="flex flex-1 flex-col items-center justify-center gap-2 py-6">
							<Thermometer class="text-muted-foreground size-12 opacity-30" />
							<p class="text-muted-foreground text-sm">{$t('dash.waitingFirstMeasurement')}</p>
						</div>
					{/if}
				</div>

				<!-- Recent Measurements — Task 4 -->
				<div class="border-border/60 bg-card flex flex-col rounded-xl border p-6 shadow-xs sm:p-7">
					<div class="mb-4 flex items-center gap-2.5">
						<ChartLine class="text-primary size-5" />
						<h3 class="text-sm font-semibold">{$t('dash.recentMeasurements')}</h3>
					</div>

					<div class="mb-4 flex flex-wrap gap-1">
						{#each rangePresets as preset}
							<Button
								variant={rangeDays === preset.value ? 'secondary' : 'ghost'}
								size="xs"
								onclick={() => (rangeDays = preset.value)}
							>
								{preset.label}
							</Button>
						{/each}
					</div>

					{#if rangeDays === 'custom'}
						<div class="mb-4 flex flex-wrap items-center gap-3">
							<div class="flex items-center gap-2">
								<span class="text-muted-foreground text-xs">{$t('dash.from')}</span>
								<input
									type="date"
									value={customFrom.format('YYYY-MM-DD')}
									onchange={(e) => {
										const d = dayjs(e.currentTarget.value);
										if (d.isValid()) customFrom = d;
									}}
									class="border-input bg-background h-8 rounded-md border px-2 font-mono text-xs"
								/>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-muted-foreground text-xs">{$t('dash.to')}</span>
								<input
									type="date"
									value={customTo.format('YYYY-MM-DD')}
									onchange={(e) => {
										const d = dayjs(e.currentTarget.value);
										if (d.isValid()) customTo = d;
									}}
									class="border-input bg-background h-8 rounded-md border px-2 font-mono text-xs"
								/>
							</div>
						</div>
					{/if}

					{#if $measurementStatsQuery.isPending}
						<div class="space-y-3">
							<div class="grid grid-cols-4 gap-2">
								{#each Array(4) as _}
									<Skeleton class="h-14 rounded-lg" />
								{/each}
							</div>
							<Skeleton class="h-[260px] w-full rounded-lg" />
						</div>
					{:else if $measurementStatsQuery.isError}
						<div class="flex flex-1 flex-col items-center justify-center gap-3 py-6">
							<p class="text-muted-foreground text-sm">{$t('dash.status.apiUnavailable')}</p>
							<Button variant="outline" size="xs" onclick={() => $measurementStatsQuery.refetch()}>
								{$t('dash.status.retry')}
							</Button>
						</div>
					{:else if $measurementStatsQuery.data?.length}
						{@const stats = $measurementStatsQuery.data}
						{@const maxTemp = Math.max(...stats.map((s) => s.temperature))}
						{@const minTemp = Math.min(...stats.map((s) => s.temperature))}
						{@const avgHumidity = stats.reduce((a, s) => a + s.humidity, 0) / stats.length}

						<div class="mb-4 grid grid-cols-4 gap-2">
							<div class="bg-muted/50 flex flex-col items-center gap-0.5 rounded-lg p-2.5">
								<span class="text-muted-foreground text-[10px]">{$t('dash.maxTemp')}</span>
								<span class="text-sm font-bold tabular-nums">{maxTemp.toFixed(1)}°</span>
							</div>
							<div class="bg-muted/50 flex flex-col items-center gap-0.5 rounded-lg p-2.5">
								<span class="text-muted-foreground text-[10px]">{$t('dash.minTemp')}</span>
								<span class="text-sm font-bold tabular-nums">{minTemp.toFixed(1)}°</span>
							</div>
							<div class="bg-muted/50 flex flex-col items-center gap-0.5 rounded-lg p-2.5">
								<span class="text-muted-foreground text-[10px]">{$t('dash.avgHumidity')}</span>
								<span class="text-sm font-bold tabular-nums">{Math.round(avgHumidity)}%</span>
							</div>
							<div class="bg-muted/50 flex flex-col items-center gap-0.5 rounded-lg p-2.5">
								<span class="text-muted-foreground text-[10px]">{$t('dash.days')}</span>
								<span class="text-sm font-bold tabular-nums">{stats.length}</span>
							</div>
						</div>

						<StatsChart
							chartData={stats.map((s) => ({ date: s.date.toDate(), value: s.temperature }))}
							lineColor="red"
							suffix="°C"
							title={$t('dash.temperature')}
						/>
						<div class="mt-3">
							<StatsChart
								chartData={stats.map((s) => ({ date: s.date.toDate(), value: s.humidity }))}
								lineColor="blue"
								suffix="%"
								title={$t('dash.humidity')}
							/>
						</div>
					{:else}
						<div class="flex flex-1 flex-col items-center justify-center gap-2 py-6">
							<ChartLine class="text-muted-foreground size-12 opacity-30" />
							<p class="text-muted-foreground text-sm">{$t('dash.noDataPeriod')}</p>
						</div>
					{/if}
				</div>

				<!-- Forecast — Task 5 -->
				<div class="border-border/60 bg-card flex flex-col rounded-xl border p-6 shadow-xs sm:p-7">
					<div class="mb-5 flex items-center gap-2.5">
						<CloudSun class="text-primary size-5" />
						<h3 class="text-sm font-semibold">{$t('dash.forecastWidget')}</h3>
					</div>

					{#if $forecastQuery.isPending}
						<div class="space-y-3">
							<Skeleton class="h-20 w-full rounded-lg" />
							<div class="grid grid-cols-3 gap-2">
								{#each Array(6) as _}
									<Skeleton class="h-10 rounded" />
								{/each}
							</div>
						</div>
					{:else if $forecastQuery.isError}
						<div class="flex flex-1 flex-col items-center justify-center gap-3 py-6">
							<p class="text-muted-foreground text-sm">{$t('dash.status.apiUnavailable')}</p>
							<Button variant="outline" size="xs" onclick={() => $forecastQuery.refetch()}>
								{$t('dash.status.retry')}
							</Button>
						</div>
					{:else if $forecastQuery.data?.results?.length}
						<ForecastCard
							forecast={$forecastQuery.data.results[0]}
							stationId={globalState.stationId}
						/>
					{:else}
						<div class="flex flex-1 flex-col items-center justify-center gap-2 py-6">
							<CloudSun class="text-muted-foreground size-12 opacity-30" />
							<p class="text-muted-foreground text-sm">{$t('dash.noForecast')}</p>
						</div>
					{/if}
				</div>

				<!-- Map — Task 6 -->
				<div class="border-border/60 bg-card flex flex-col rounded-xl border p-6 shadow-xs sm:p-7">
					<div class="mb-5 flex items-center gap-2.5">
						<MapPin class="text-primary size-5" />
						<h3 class="text-sm font-semibold">{$t('dash.mapWidget')}</h3>
					</div>

					{#if currentStation?.latitude && currentStation?.longitude}
						<div class="overflow-hidden rounded-lg border">
							<Map
								latitude={currentStation.latitude}
								longitude={currentStation.longitude}
								zoom={13}
								class="h-[180px] sm:h-[220px]"
								preview={true}
							/>
						</div>
					{:else}
						<div class="flex flex-1 flex-col items-center justify-center gap-2 py-6">
							<MapPin class="text-muted-foreground size-12 opacity-30" />
							<p class="text-muted-foreground text-sm">{$t('dash.noLocation')}</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Forecast Table — Task 7 -->
			{#if $forecastQuery.isPending}
				<Skeleton class="h-40 w-full rounded-xl" />
			{:else if $forecastQuery.isError}
				<div class="border-border/60 bg-card rounded-xl border p-6 text-center shadow-xs">
					<p class="text-muted-foreground text-sm">{$t('dash.status.apiUnavailable')}</p>
					<Button variant="outline" size="xs" class="mt-2" onclick={() => $forecastQuery.refetch()}>
						{$t('dash.status.retry')}
					</Button>
				</div>
			{:else if $forecastQuery.data?.results?.length}
				<ForecastTable
					forecast={$forecastQuery.data.results}
					updatedDate={$forecastQuery.data.created_at}
				/>
			{/if}

			<!-- Bottom actions -->
			<div class="flex items-center justify-center gap-3 pt-4">
				<Button variant="outline" size="sm" onclick={() => (viewAllOpen = true)}>
					{$t('dash.viewAllStations')}
				</Button>
				{#if globalState.user}
					<Button variant="default" size="sm" onclick={() => (createStationOpen = true)}>
						<Plus class="size-4" />
						{$t('dash.dialog.createStation.trigger')}
					</Button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- "View All Stations" Dialog — Task 8 -->
	{#if viewAllOpen}
		<Dialog.Root bind:open={viewAllOpen}>
			<Dialog.MobileContent class="flex max-w-4xl flex-col sm:max-h-[90vh] [&>button]:hidden">
				<Dialog.Header class="flex w-full flex-row justify-between">
					<div class="flex flex-col space-y-2">
						<Dialog.Title class="w-fit">{$t('dash.viewAllStations')}</Dialog.Title>
						<Dialog.Description>{$t('dash.viewAllDescription')}</Dialog.Description>
					</div>
					<Dialog.Close class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
						<X class="size-4" />
					</Dialog.Close>
				</Dialog.Header>

				<div class="mt-4 flex items-center gap-2">
					<Input
						type="text"
						placeholder={$t('dash.searchPlaceholder')}
						bind:value={searchTerm}
						class="h-8 w-40 font-mono text-xs"
					/>
					{#if globalState.user}
						<Button
							variant="default"
							size="sm"
							class="gap-1.5"
							onclick={() => {
								viewAllOpen = false;
								createStationOpen = true;
							}}
						>
							<Plus class="size-3.5" />
							{$t('dash.dialog.createStation.trigger')}
						</Button>
					{/if}
				</div>

				<div class="mt-4 grid grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
					{#if $stationsQuery.isPending}
						{#each Array(4) as _}
							<div class="border-border flex w-full flex-col gap-2 rounded-xl border p-5">
								<Skeleton class="h-5 w-1/2 rounded-md" />
								<Skeleton class="h-4 w-1/3 rounded-md" />
								<div
									class="mt-3 flex gap-4 border-t border-black/[0.03] pt-3 dark:border-white/[0.03]"
								>
									<Skeleton class="h-8 w-16 rounded-lg" />
									<Skeleton class="h-8 w-16 rounded-lg" />
								</div>
							</div>
						{/each}
					{:else if $stationsQuery.isError}
						<div
							class="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
						>
							<AlertCircle class="mb-2 size-4" />
							<p class="text-sm font-semibold">{$t('dash.status.apiUnavailable')}</p>
							<p class="text-xs">{$t('dash.status.apiUnavailableHint')}</p>
						</div>
					{:else if $stationsQuery.data?.results}
						{@const filtered = $stationsQuery.data.results.filter((s) =>
							`${s.name} ${s.city_name}`.toLowerCase().includes(searchTerm.toLowerCase())
						)}
						{#if filtered.length === 0}
							<div class="text-muted-foreground col-span-full py-10 text-center font-mono text-xs">
								{$t('dash.noStationsFound')}
							</div>
						{:else}
							{#each filtered as station}
								{@const isSelected = globalState.stationId === station.id}
								<button
									class={cn([
										'group relative flex w-full flex-col items-start gap-1 overflow-hidden rounded-xl border p-4 text-left transition-all duration-200',
										isSelected
											? 'border-primary bg-primary/5 shadow-sm'
											: 'border-border hover:bg-accent hover:border-accent-foreground/20'
									])}
									onclick={() => setSelectedStation(station.id)}
								>
									{#if isSelected}
										<CheckCircle2 class="text-primary absolute top-3 right-3 size-4" />
									{/if}
									<div class="z-10 flex w-full items-center justify-between">
										<div class="flex flex-col">
											<span class="text-sm font-bold tracking-tight">{station.name}</span>
											<span
												class="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase opacity-60"
											>
												{station.city_name}
											</span>
										</div>
									</div>
									<div class="mt-3 flex w-full gap-2">
										<Button
											variant="ghost"
											size="icon"
											class="size-7"
											onclick={(e) => {
												e.stopPropagation();
												openEditStation(station);
											}}
										>
											<Edit class="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											class="h-7 text-xs"
											onclick={(e) => {
												e.stopPropagation();
												setSelectedStation(station.id);
											}}
										>
											{isSelected ? $t('dash.selected') : $t('dash.selectStation')}
										</Button>
									</div>
								</button>
							{/each}
						{/if}
					{:else}
						<div
							class="col-span-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
						>
							<p class="text-sm font-semibold">{$t('dash.noStations')}</p>
							<p class="mt-1 text-xs">{$t('dash.noStationsHint')}</p>
						</div>
					{/if}
				</div>
			</Dialog.MobileContent>
		</Dialog.Root>
	{/if}

	<!-- Station Dialog — Task 8 -->
	{#if createStationOpen}
		<StationDialog
			bind:open={createStationOpen}
			station={selectedStation}
			startInEditMode={editMode}
		/>
	{/if}
</main>
