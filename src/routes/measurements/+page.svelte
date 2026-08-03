<script lang="ts">
	import { browser } from '$app/environment';
	import CurrentDayCard from '@/components/measurements/current-day-card.svelte';
	import DayDialog from '@/components/measurements/day-dialog.svelte';
	import DeleteDialog from '@/components/measurements/delete-dialog.svelte';
	import StatsChart from '@/components/measurements/stats-chart.svelte';
	import StatsTable from '@/components/measurements/stats-table.svelte';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { Skeleton } from '@/components/ui/skeleton';
	import { api } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import type { MeasurementStat } from '@/shared/types';
	import { t } from '@/translations';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { gsap } from 'gsap';
	import { Ellipsis, Thermometer, Trash2 } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const startOfWeek = dayjs().subtract(6, 'days').startOf('day');
	const endOfWeek = dayjs().endOf('day');

	const startDate = startOfWeek.format('YYYY-MM-DD');
	const endDate = endOfWeek.format('YYYY-MM-DD');

	const weekStatsQuery = $derived(
		createQuery({
			queryKey: ['weekStats', globalState.stationId, startDate, endDate],
			queryFn: () => api.getMeasurementStats(globalState.stationId!, startDate, endDate),
			enabled: !!globalState.stationId,
			select: (data) =>
				data.map((stat) => ({
					...stat,
					date: dayjs(stat.date),
					temperature: parseFloat(stat.temperature.toFixed(2)),
					humidity: parseFloat(stat.humidity.toFixed(2))
				}))
		})
	);

	const createChartData = (key: 'temperature' | 'humidity') =>
		$weekStatsQuery.data?.map((data) => ({
			date: data.date.toDate(),
			value: data[key]
		}));

	const weekTempChartData = $derived(createChartData('temperature'));
	const weekHumChartData = $derived(createChartData('humidity'));

	const emptyWeekStats = $derived(
		$weekStatsQuery.status == 'success' && !$weekStatsQuery.data?.length
	);
	const hasStationSelection = $derived(!isNaN(globalState.stationId));

	let deleteDialogOpen = $state(false);
	let measurementsDialogOpen = $state(false);
	let currentStatIndex = $state(-1);
	const selectedDate = $derived(
		currentStatIndex > -1 && $weekStatsQuery.data
			? $weekStatsQuery.data![currentStatIndex].date
			: undefined
	);

	function handleSelectDay(index: number) {
		currentStatIndex = index;
		measurementsDialogOpen = true;
	}

	function handleNavigate(index: number) {
		if ($weekStatsQuery.data && index >= 0 && index < $weekStatsQuery.data.length) {
			currentStatIndex = index;
		}
	}

	const today = dayjs();

	const latestMeasurementQuery = $derived(
		createQuery({
			queryKey: ['latestMeasurement', globalState.stationId],
			queryFn: async () => {
				try {
					return await api.getLatestMeasurement(globalState.stationId);
				} catch (error: any) {
					if (error?.response?.status === 404) return null;
					throw error;
				}
			},
			enabled: !!globalState.stationId,
			select: (data) =>
				data
					? {
							...data,
							temperature: parseFloat(data.temperature.toFixed(2)),
							humidity: parseFloat(data.humidity.toFixed(2)),
							timestamp: dayjs(data.timestamp)
						}
					: null
		})
	);

	const isPageLoading = $derived(
		hasStationSelection && ($weekStatsQuery.isLoading || $latestMeasurementQuery.isLoading)
	);

	function getTodayStat(): MeasurementStat | undefined {
		if ($weekStatsQuery.data) {
			return $weekStatsQuery.data.find((stat) => stat.date.isSame(today, 'day'));
		}
		return undefined;
	}

	const todayStat = $derived(getTodayStat());

	function handleLastDay() {
		currentStatIndex = todayStat ? $weekStatsQuery.data!.indexOf(todayStat) : -1;
		measurementsDialogOpen = true;
	}

	let pageRoot: HTMLElement;

	onMount(() => {
		if (!browser) return;

		const ctx = gsap.context(() => {
			gsap.to('.measurements-widget', {
				y: 0,
				opacity: 1,
				stagger: 0.08,
				duration: 0.5,
				ease: 'power2.out'
			});
		}, pageRoot);

		return () => ctx.revert();
	});
</script>

<svelte:head>
	<title>{$t('measurements.pageTitle')}</title>
</svelte:head>

<div bind:this={pageRoot} class="flex w-full flex-col items-center gap-y-6 p-5">
	<div class="flex w-full max-w-xl items-center justify-between">
		<div class="mb-5 flex w-full items-center gap-3">
			<span class="text-foreground font-mono text-xs font-semibold tracking-widest uppercase">
				{#if globalState.station?.name}
					{globalState.station.name}
				{/if}
				{$t('measurements.title')}
			</span>
			<div class="bg-border h-px flex-1"></div>
			{#if globalState.user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}>
						<Ellipsis class="h-3.5 w-3.5" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-40 p-1 font-mono">
						<DropdownMenu.Item
							onclick={() => (deleteDialogOpen = true)}
							class="text-destructive hover:bg-destructive/10 cursor-pointer rounded-md px-2 py-2 text-xs transition-colors"
						>
							<Trash2 class="h-3.5 w-3.5" />
							{$t('measurements.dialog.delete.title')}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
	</div>

	<main class="flex w-full flex-col items-center gap-6">
		{#if !hasStationSelection}
			<div class="border-border/50 bg-card w-full max-w-xl rounded-lg border p-6">
				<p class="text-sm font-semibold">{$t('measurements.status.no_station')}</p>
				<p class="text-muted-foreground mt-1 text-xs">
					{$t('measurements.status.no_station_hint')}
				</p>
			</div>
		{:else if isPageLoading}
			<div class="w-full max-w-xl space-y-6">
				<Skeleton class="h-40 w-full rounded-lg" />
				<Skeleton class="h-12 w-full rounded-lg" />
				<Skeleton class="h-12 w-full rounded-lg" />
				<Skeleton class="h-56 w-full rounded-lg" />
			</div>
		{:else if $weekStatsQuery.isError || $latestMeasurementQuery.isError}
			<div class="border-border/50 bg-card w-full max-w-xl rounded-lg border p-6">
				<p class="text-sm font-semibold">{$t('measurements.status.api_unavailable')}</p>
				<p class="text-muted-foreground mt-1 text-xs">
					{$t('measurements.status.api_unavailable_hint')}
				</p>
			</div>
		{:else}
			<div class="measurements-widget">
				<CurrentDayCard
					{todayStat}
					latestMeasurement={$latestMeasurementQuery.data ?? undefined}
					isLoading={$weekStatsQuery.isLoading || $latestMeasurementQuery.isLoading}
					{handleLastDay}
				/>
			</div>

			{#if !emptyWeekStats}
				<div class="flex w-full max-w-xl flex-col gap-y-6">
					<div class="measurements-widget">
						<StatsTable weekStats={$weekStatsQuery.data!} onSelectDay={handleSelectDay} />
					</div>

					{#if $weekStatsQuery.data && $weekStatsQuery.data.length > 1}
						<div class="w-full space-y-6">
							<div class="grid grid-cols-1 gap-6">
								<div class="measurements-widget">
									<StatsChart
										chartData={weekTempChartData!}
										lineColor="red"
										suffix="°C"
										title={$t('measurements.chart.temperature')}
									/>
								</div>
								<div class="measurements-widget">
									<StatsChart
										chartData={weekHumChartData!}
										lineColor="blue"
										suffix="%"
										title={$t('measurements.chart.humidity')}
									/>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="border-border/50 bg-card w-full max-w-xl rounded-lg border p-6">
					<p class="text-sm font-semibold">{$t('measurements.status.no_data')}</p>
					<p class="text-muted-foreground mt-1 text-xs">{$t('measurements.status.no_data_hint')}</p>
				</div>
			{/if}
		{/if}
	</main>

	<DayDialog
		open={measurementsDialogOpen}
		onOpenChange={(open) => (measurementsDialogOpen = open)}
		{selectedDate}
		stationId={globalState.stationId}
		onNavigate={handleNavigate}
		currentIndex={currentStatIndex}
		weekStats={$weekStatsQuery.data!}
	/>

	<DeleteDialog bind:open={deleteDialogOpen} stationId={globalState.stationId} />
</div>

<style>
	.measurements-widget {
		opacity: 0;
		transform: translateY(16px);
	}
</style>
