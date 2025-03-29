<script lang="ts">
	import { page } from '$app/state';
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

	const startOfWeek = dayjs().startOf('week');
	const endOfWeek = dayjs().endOf('week');

	const startDate = startOfWeek.format('YYYY-MM-DD');
	const endDate = endOfWeek.format('YYYY-MM-DD');

	const weekStatsQuery = $derived(
		createQuery({
			queryKey: ['weekStats', stationId, startDate, endDate],
			queryFn: () =>
				api.getMeasurementStats(
					stationId!,
					startDate,
					endDate
				),
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

	const emptyWeekStats = $derived($weekStatsQuery.status == 'success' && !$weekStatsQuery.data?.length);

	let deleteDialogOpen = $state(false);
	let measurementsDialogOpen = $state(false);
	let selectedDate = $state('');

	function handleSelectDay(date: string) {
		selectedDate = date;
		measurementsDialogOpen = true;
	}
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

	<main class="flex w-full flex-col items-center">
		<div class="mb-4 text-center">
			<span class="text-lg font-bold">Weekly Measurement Stats</span>
			<div class="text-sm">
				From {startOfWeek.format('MMM D')} to {endOfWeek.format('MMM D')}
			</div>
		</div>

		{#if !emptyWeekStats}
			<div class="flex w-full max-w-xl flex-col gap-y-6">
				<StatsTable 
					weekStats={$weekStatsQuery.data!} 
					onSelectDay={handleSelectDay} 
				/>
				
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
	/>

	<DeleteDialog bind:open={deleteDialogOpen} {stationId} />
</div>
