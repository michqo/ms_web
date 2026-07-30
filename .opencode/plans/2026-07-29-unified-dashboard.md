# Unified Personal Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/dash` station-grid page with a personal weather dashboard showing current conditions, recent measurements with date range selector, forecast, and station map.

**Architecture:** Single-page Svelte 5 rewrite of `dash/+page.svelte`. Five TanStack Query queries feed seven inline widgets in a responsive grid. Existing station-card grid moves into a dialog. Forecast page loses its redundant map.

**Tech Stack:** Svelte 5, SvelteKit 5, TanStack Query, Tailwind CSS v4, dayjs, LayerChart, lucide-svelte, shadcn-svelte components.

## Global Constraints

- `pnpm check` must pass (0 errors, 0 warnings) after every task
- `pnpm lint` (Prettier) must pass after every task
- All text uses `$t()` i18n — no hardcoded English strings
- Import path alias `@/*` → `src/lib/*`
- Svelte 5 runes: `$state()`, `$derived()`, `$effect()`, `$props()`, `$bindable()`
- TypeScript strict mode on

---

### Task 1: Scaffold the new dashboard — queries, layout skeleton, no-station state

**Files:**

- Modify: `src/routes/dash/+page.svelte` (full rewrite)

**Interfaces:**

- Consumes: `api` from `@/shared`, `globalState` from `@/shared/runes.svelte`, `createQuery` from `@tanstack/svelte-query`, `t` from `@/translations`, `dayjs`
- Produces: `stationsQuery`, `latestMeasurementQuery`, `measurementStatsQuery`, `forecastQuery` (reactive `$derived` queries), `rangeDays` state, skeleton layout grid, station selection logic

- [ ] **Step 1: Create the dashboard scaffold**

Write `src/routes/dash/+page.svelte` with the full `<script>` block (queries, state, derived values) and a skeleton `<main>` layout. The scaffold includes:

1. All four TanStack queries (`stationsQuery`, `latestMeasurementQuery`, `measurementStatsQuery`, `forecastQuery`)
2. Date range state (`rangeDays`, `customFrom`, `customTo`) with `$derived` (`dateFrom`, `dateTo`)
3. `currentStation`, `latestMeasurement`, `onlineStatus` derived values
4. "No station selected" prompt with "Select Station" and "Create Station" buttons
5. Loading skeleton grid (4 card-shaped skeleton placeholders + 1 row skeleton)
6. Skeleton main layout: station header row, 2x2 widget grid, full-width forecast table row, bottom action buttons
7. Placeholder widget divs with `"coming in Task N"` text for positions 3-7

Use `$derived(createQuery(...))` pattern (matching existing codebase convention in `forecast/+page.svelte` and `measurements/+page.svelte`).

```svelte
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
		if (!latestMeasurement)
			return { color: 'gray', text: $t('dash.status.noData'), pulse: false };
		const minutes = dayjs().diff(latestMeasurement.timestamp, 'minute');
		if (minutes < 5)
			return { color: 'emerald', text: $t('dash.status.updatedJustNow'), pulse: true };
		if (minutes < 30)
			return {
				color: 'emerald',
				text: $t('dash.status.updatedAgo', { n: `${minutes}m` }),
				pulse: false
			};
		if (minutes < 120)
			return {
				color: 'amber',
				text: $t('dash.status.updatedAgo', { n: `${Math.floor(minutes / 60)}h` }),
				pulse: false
			};
		if (minutes < 1440)
			return {
				color: 'orange',
				text: $t('dash.status.lastSeenAgo', { n: `${Math.floor(minutes / 60)}h` }),
				pulse: false
			};
		return {
			color: 'red',
			text: $t('dash.status.lastSeenAgo', { n: `${Math.floor(minutes / 1440)}d` }),
			pulse: false
		};
	});

	let viewAllOpen = $state(false);
	let createStationOpen = $state(false);
	let searchTerm = $state('');
	let selectedStation: Station | undefined = $state();
	let editMode = $state(false);

	const hasStation = $derived(!!globalState.stationId);

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
							class="size-2 rounded-full"
							class="bg-{onlineStatus.color}-500"
							class:animate-pulse={onlineStatus.pulse}
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
							<Button
								variant="outline"
								size="xs"
								onclick={() => $latestMeasurementQuery.refetch()}
							>
								{$t('dash.status.retry')}
							</Button>
						</div>
					{:else if latestMeasurement}
						{@const m = latestMeasurement}
						<div class="flex flex-1 flex-col justify-center">
							<span class="text-5xl font-bold tracking-tight">{m.temperature.toFixed(1)}°C</span>
							<div class="text-muted-foreground mt-1 font-mono text-xs">
								{$t('dash.lastUpdatedAt')} {m.timestamp.format('HH:mm')}
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
									<span class="text-xs font-semibold tabular-nums">{(m as any).uv_index ?? '—'}</span>
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
						{@const presets: { value: typeof rangeDays; label: string }[] = [
							{ value: '1d', label: $t('dash.range1d') },
							{ value: '7d', label: $t('dash.range7d') },
							{ value: '30d', label: $t('dash.range30d') },
							{ value: 'custom', label: $t('dash.rangeCustom') }
						]}
						{#each presets as preset}
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
							<Button
								variant="outline"
								size="xs"
								onclick={() => $measurementStatsQuery.refetch()}
							>
								{$t('dash.status.retry')}
							</Button>
						</div>
					{:else if $measurementStatsQuery.data?.length}
						{@const stats = $measurementStatsQuery.data}
						{@const maxTemp = Math.max(...stats.map((s) => s.temperature))}
						{@const minTemp = Math.min(...stats.map((s) => s.temperature))}
						{@const avgHumidity =
							stats.reduce((a, s) => a + s.humidity, 0) / stats.length}

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
							<Button
								variant="outline"
								size="xs"
								onclick={() => $forecastQuery.refetch()}
							>
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
					<Button
						variant="outline"
						size="xs"
						class="mt-2"
						onclick={() => $forecastQuery.refetch()}
					>
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
							<div
								class="text-muted-foreground col-span-full py-10 text-center font-mono text-xs"
							>
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
			{onclose}
		/>
	{/if}
</main>
```

- [ ] **Step 2: Add all i18n keys to `en/dash.json`**

Read the existing `src/lib/translations/en/dash.json`, merge in every key referenced in the scaffold above. Example keys needed:

```json
{
	"noStationTitle": "No station selected",
	"noStationHint": "Select a station to view your personal weather dashboard.",
	"selectStation": "Select",
	"selected": "Current",
	"currentConditions": "Current Conditions",
	"lastUpdatedAt": "Last updated at",
	"humidity": "Humidity",
	"pressure": "Pressure",
	"wind": "Wind",
	"rain": "Rain",
	"uv": "UV Index",
	"windDirection": "Wind Dir",
	"waitingFirstMeasurement": "Waiting for first measurement",
	"recentMeasurements": "Recent Measurements",
	"range1d": "1d",
	"range7d": "7d",
	"range30d": "30d",
	"rangeCustom": "Custom",
	"from": "From",
	"to": "To",
	"maxTemp": "Max",
	"minTemp": "Min",
	"avgHumidity": "Avg humid",
	"days": "days",
	"noDataPeriod": "No data for this period",
	"forecastWidget": "Forecast · Today",
	"noForecast": "No forecast data available",
	"mapWidget": "Station Location",
	"noLocation": "Station location not set",
	"viewAllStations": "All Stations",
	"viewAllDescription": "Select a station to view its dashboard.",
	"noStations": "No stations found",
	"noStationsHint": "Create your first station to get started.",
	"noStationsFound": "No stations match your search.",
	"temperature": "Temperature",
	"status": {
		"updatedJustNow": "Updated just now",
		"updatedAgo": "Updated {n} ago",
		"lastSeenAgo": "Last seen {n} ago",
		"noData": "No data received",
		"apiUnavailable": "Could not fetch data",
		"apiUnavailableHint": "The API is unavailable. Please try again later.",
		"retry": "Retry"
	}
}
```

Do the same for `src/lib/translations/sk/dash.json` with Slovak equivalents.

- [ ] **Step 3: Run typecheck**

```bash
pnpm check
```

Expected: 0 errors, 0 warnings. Fix any i18n key mismatches, missing imports, or type errors.

- [ ] **Step 4: Run linter**

```bash
pnpm lint
```

Expected: all files pass Prettier. Run `pnpm format` if needed.

- [ ] **Step 5: Commit**

```bash
git add src/routes/dash/+page.svelte src/lib/translations/en/dash.json src/lib/translations/sk/dash.json
git commit -m "feat(dash): unified personal dashboard with date range, forecast, map"
```

---

### Task 2: Remove forecast page map (redundant with dashboard)

**Files:**

- Modify: `src/routes/forecast/+page.svelte` (remove map import + map block)

**Interfaces:**

- Consumes: existing forecast page template
- Produces: cleaner forecast page — station name header, forecast card, forecast table (no map)

- [ ] **Step 1: Remove map import and map markup**

Remove `import { Map } from '@/components/ui/map';` from the `<script>` block.
Remove the `{#if forecast.latitude && forecast.longitude}` map block (lines 69–79 of current file).
Flatten the remaining layout — station name + city header, then card + table stack.

- [ ] **Step 2: Run typecheck and lint**

```bash
pnpm check && pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/forecast/+page.svelte
git commit -m "refactor(forecast): remove redundant map preview, now on dashboard"
```

---

### Task 3: Handle `StationDialog` onclose and edge cases

**Files:**

- Modify: `src/routes/dash/+page.svelte` (dialog close handler)

**Interfaces:**

- Consumes: `StationDialog` props, `createStationOpen`, `selectedStation`, `editMode`
- Produces: proper state reset when station dialog closes

- [ ] **Step 1: Add `onclose` handler to StationDialog**

Check if `StationDialog` (`src/lib/components/station/station-dialog.svelte`) supports an `onclose` callback. If it does, wire it. If it only uses `bind:open`, wrap it in a `{#key}` block or add an `$effect` that resets `selectedStation` and `editMode` when `createStationOpen` becomes `false`:

```svelte
$effect(() => {
	if (!createStationOpen) {
		selectedStation = undefined;
		editMode = false;
	}
});
```

- [ ] **Step 2: Verify MeasurementStat type fields**

Confirm `MeasurementStat` in `types.ts` has `temperature` and `humidity` fields (used in summary stat computation). If the API returns additional daily aggregates (rain, wind_speed), add them to the type.

- [ ] **Step 3: Run final verification**

```bash
pnpm check && pnpm lint && pnpm build
```

All three must pass with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/dash/+page.svelte src/routes/forecast/+page.svelte src/lib/shared/types.ts
git commit -m "fix(dash): handle station dialog close state reset, verify types"
```
