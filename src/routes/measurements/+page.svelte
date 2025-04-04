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
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { Ellipsis, Trash2 } from 'lucide-svelte';

	const startOfWeek = dayjs().subtract(6, 'days').startOf('day');
	const endOfWeek = dayjs().endOf('day');

	const startDate = startOfWeek.format('YYYY-MM-DD');
	const endDate = endOfWeek.format('YYYY-MM-DD');

	const weekStatsQuery = $derived(
		createQuery({
			queryKey: ['weekStats', globalState.stationId, startDate, endDate],
			queryFn: () => api.getMeasurementStats(globalState.stationId!, startDate, endDate),
			enabled: !!globalState.stationId
		})
	);

	const createChartData = (key: keyof MeasurementStat) =>
		$weekStatsQuery.data?.map((data) => ({
			date: new Date(data.date),
			value: data[key]
		}));

	const weekTempChartData = $derived(createChartData('temperature'));
	const weekHumChartData = $derived(createChartData('humidity'));

	const emptyWeekStats = $derived(
		$weekStatsQuery.status == 'success' && !$weekStatsQuery.data?.length
	);

	let deleteDialogOpen = $state(false);
	let measurementsDialogOpen = $state(false);
	let currentStatIndex = $state(-1);
	const selectedDate = $derived(
		currentStatIndex > -1 && $weekStatsQuery.data
			? dayjs($weekStatsQuery.data![currentStatIndex].date)
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
			queryFn: () => api.getLatestMeasurement(globalState.stationId),
			enabled: !!globalState.stationId
		})
	);

	function getTodayStat(): MeasurementStat | undefined {
		if ($weekStatsQuery.data) {
			return $weekStatsQuery.data.find((stat) => dayjs(stat.date).isSame(today, 'day'));
		}
		return undefined;
	}

	const todayStat = $derived(getTodayStat());
</script>

<div class="flex w-full flex-col items-center gap-y-6 py-6">
	<div class="flex w-full max-w-xl items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight">Measurements</h1>
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
					Delete measurements
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<main class="flex w-full flex-col items-center gap-6">
		<CurrentDayCard
			{todayStat}
			latestMeasurement={$latestMeasurementQuery.data}
			isLoading={$weekStatsQuery.isLoading || $latestMeasurementQuery.isLoading}
			currentIndex={currentStatIndex}
			onViewDetails={handleSelectDay}
		/>

		{#if !emptyWeekStats}
			<div class="flex w-full max-w-xl flex-col gap-y-6">
				<StatsTable weekStats={$weekStatsQuery.data!} onSelectDay={handleSelectDay} />

				<div class="w-full space-y-6">
					<div class="grid grid-cols-1 gap-6">
						<StatsChart
							chartData={weekTempChartData!}
							lineColor="red"
							suffix="°C"
							title="Weekly Temperature"
						/>
						<StatsChart
							chartData={weekHumChartData!}
							lineColor="blue"
							suffix="%"
							title="Weekly Humidity"
						/>
					</div>
				</div>
			</div>
		{:else}
			<div class="flex w-screen max-w-xl flex-col items-center gap-5">
				<Skeleton class="h-[40px] w-full" />
				<Skeleton class="h-[40px] w-full" />
			</div>
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
