<script lang="ts">
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
	import { Ellipsis, Thermometer, Trash2 } from 'lucide-svelte';

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
</script>

<svelte:head>
	<title>{$t('measurements.pageTitle')}</title>
</svelte:head>

<div class="flex w-full flex-col items-center gap-y-6 p-5">
	<div class="flex w-full max-w-xl items-center justify-between">
		<div class="flex items-center gap-2">
			<Thermometer class="text-primary h-6 w-6" />
			{#if globalState.station?.name}
				<h1 class="text-2xl font-bold tracking-tight">
					{globalState.station.name}
					{$t('measurements.title')}
				</h1>
			{:else if hasStationSelection && !$weekStatsQuery.isSuccess && !$weekStatsQuery.isError}
				<div class="flex items-center gap-2">
					<Skeleton class="h-7 w-36" />
					<h1 class="text-2xl font-bold tracking-tight">{$t('measurements.title')}</h1>
				</div>
			{:else}
				<h1 class="text-2xl font-bold tracking-tight">{$t('measurements.title')}</h1>
			{/if}
		</div>
		{#if globalState.user}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'secondary', size: 'sm' })}>
					<Ellipsis />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item
						onclick={() => (deleteDialogOpen = true)}
						class="flex items-center gap-x-2"
					>
						<Trash2 />
						{$t('measurements.dialog.delete.title')}
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</div>

	<main class="flex w-full flex-col items-center gap-6">
		{#if !hasStationSelection}
			<div
				class="w-full max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
			>
				<p class="text-base font-semibold">{$t('measurements.status.no_station')}</p>
				<p class="mt-1 text-sm">{$t('measurements.status.no_station_hint')}</p>
			</div>
		{:else if isPageLoading}
			<div class="w-full max-w-xl space-y-6">
				<Skeleton class="h-40 w-full rounded-xl" />
				<Skeleton class="h-12 w-full rounded-xl" />
				<Skeleton class="h-12 w-full rounded-xl" />
				<Skeleton class="h-56 w-full rounded-xl" />
			</div>
		{:else if $weekStatsQuery.isError || $latestMeasurementQuery.isError}
			<div
				class="w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
			>
				<p class="text-base font-semibold">{$t('measurements.status.api_unavailable')}</p>
				<p class="mt-1 text-sm">{$t('measurements.status.api_unavailable_hint')}</p>
			</div>
		{:else}
			<CurrentDayCard
				{todayStat}
				latestMeasurement={$latestMeasurementQuery.data ?? undefined}
				isLoading={$weekStatsQuery.isLoading || $latestMeasurementQuery.isLoading}
				{handleLastDay}
			/>

			{#if !emptyWeekStats}
				<div class="flex w-full max-w-xl flex-col gap-y-6">
					<StatsTable weekStats={$weekStatsQuery.data!} onSelectDay={handleSelectDay} />

					{#if $weekStatsQuery.data && $weekStatsQuery.data.length > 1}
						<div class="w-full space-y-6">
							<div class="grid grid-cols-1 gap-6">
								<StatsChart
									chartData={weekTempChartData!}
									lineColor="red"
									suffix="°C"
									title={$t('measurements.chart.temperature')}
								/>
								<StatsChart
									chartData={weekHumChartData!}
									lineColor="blue"
									suffix="%"
									title={$t('measurements.chart.humidity')}
								/>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div
					class="w-full max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
				>
					<p class="text-base font-semibold">{$t('measurements.status.no_data')}</p>
					<p class="mt-1 text-sm">{$t('measurements.status.no_data_hint')}</p>
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
