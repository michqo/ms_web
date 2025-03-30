<script lang="ts">
	import { page } from '$app/state';
	import CurrentDayCard from '@/components/measurements/current-day-card.svelte';
	import DayDialog from '@/components/measurements/day-dialog.svelte';
	import DeleteDialog from '@/components/measurements/delete-dialog.svelte';
	import StatsChart from '@/components/measurements/stats-chart.svelte';
	import StatsTable from '@/components/measurements/stats-table.svelte';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { Skeleton } from '@/components/ui/skeleton';
	import { api } from '@/shared';
	import useLocalStorage from '@/shared/runes.svelte';
	import type { MeasurementStat } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { Ellipsis, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	const stationQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	const defaultStationId = useLocalStorage('defaultStationId', undefined);
	const stationIdParam = $derived(page.params.station);
	const stationId = $derived(
		stationIdParam ? parseInt(stationIdParam) : parseInt(defaultStationId.value)
	);

	$effect(() => {
		// If stations are loaded and no station is selected, select the first one
		if ($stationQuery.data?.results.length && !defaultStationId.value) {
			const firstStation = $stationQuery.data.results[0];
			setSelectedStation(firstStation.id);
		}
	});

	const startOfWeek = dayjs().subtract(6, 'days').startOf('day');
	const endOfWeek = dayjs().endOf('day');

	const startDate = startOfWeek.format('YYYY-MM-DD');
	const endDate = endOfWeek.format('YYYY-MM-DD');

	const weekStatsQuery = $derived(
		createQuery({
			queryKey: ['weekStats', stationId, startDate, endDate],
			queryFn: () => api.getMeasurementStats(stationId!, startDate, endDate),
			enabled: !!stationId
		})
	);

	function setSelectedStation(id: number) {
		defaultStationId.value = id.toString();
		toast.success('Station selected as default');
	}

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
	let selectedDate = $state('');
	let currentStatIndex = $state(0);

	function handleSelectDay(date: string) {
		selectedDate = date;
		// Find the index of the selected date in weekStats
		if ($weekStatsQuery.data) {
			const index = $weekStatsQuery.data.findIndex(
				(stat) => dayjs(stat.date).format('YYYY-MM-DD') === date
			);
			if (index !== -1) {
				currentStatIndex = index;
			}
		}
		measurementsDialogOpen = true;
	}

	function handleNavigate(index: number) {
		if ($weekStatsQuery.data && index >= 0 && index < $weekStatsQuery.data.length) {
			currentStatIndex = index;
			selectedDate = dayjs($weekStatsQuery.data[index].date).format('YYYY-MM-DD');
		}
	}

	const today = dayjs().format('YYYY-MM-DD');

	const latestMeasurementQuery = $derived(
		createQuery({
			queryKey: ['latestMeasurement', stationId],
			queryFn: () => api.getLatestMeasurement(stationId),
			enabled: !!stationId
		})
	);

	function getTodayStat(): MeasurementStat | undefined {
		if ($weekStatsQuery.data) {
			return $weekStatsQuery.data.find((stat) => dayjs(stat.date).format('YYYY-MM-DD') === today);
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
		date={selectedDate}
		{stationId}
		onNavigate={handleNavigate}
		currentIndex={currentStatIndex}
		weekStats={$weekStatsQuery.data!}
	/>

	<DeleteDialog bind:open={deleteDialogOpen} {stationId} />
</div>
