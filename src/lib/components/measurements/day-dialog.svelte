<script lang="ts">
	import Chart from '@/components/measurements/chart.svelte';
	import Table from '@/components/measurements/table.svelte';
	import * as Accordion from '@/components/ui/accordion';
	import { Button } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Tabs from '@/components/ui/tabs';
	import { api } from '@/shared';
	import type { ListResponse, Measurement, MeasurementStat } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs, { type Dayjs } from 'dayjs';
	import { Calendar, ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		selectedDate?: Dayjs;
		stationId: number;
		onNavigate: (index: number) => void;
		currentIndex: number;
		weekStats: MeasurementStat[];
	}

	const {
		open,
		onOpenChange,
		selectedDate,
		stationId,
		onNavigate,
		currentIndex,
		weekStats
	}: Props = $props();

	const formattedDate = $derived(selectedDate?.format('dddd, MMMM D, YYYY'));
	let currentPage = $state(1);

	const select = (data: ListResponse<Measurement>) => ({
		...data,
		results: data.results.map((measurement) => ({
			...measurement,
			timestamp: dayjs(measurement.timestamp),
			temperature: parseFloat(measurement.temperature.toFixed(2)),
			humidity: parseFloat(measurement.humidity.toFixed(2))
		}))
	});

	const dataQuery = $derived(
		createQuery({
			queryKey: ['measurements', stationId, currentPage, selectedDate],
			queryFn: () => api.getMeasurements(stationId, currentPage, selectedDate!),
			enabled: !!stationId && !!selectedDate,
			select
		})
	);

	const dayMeasurementsQuery = $derived(
		createQuery({
			queryKey: ['dayMeasurements', stationId, selectedDate],
			queryFn: () => api.getMeasurements(stationId, 1, selectedDate!, 24),
			enabled: !!stationId && !!selectedDate,
			select
		})
	);

	const createChartData = (key: 'temperature' | 'humidity') =>
		$dayMeasurementsQuery.data?.results.map((data) => ({
			date: data.timestamp.toDate(),
			value: data[key]
		}));

	const tempChartData = $derived(createChartData('temperature'));
	const humChartData = $derived(createChartData('humidity'));

	const emptyData = $derived(
		$dataQuery.status == 'success' && $dataQuery.data?.results.length == 0
	);

	function handlePageChange(page: number) {
		currentPage = page;
	}

	let activeTab = $state('chart');

	function goToPrevious() {
		if (currentIndex > 0) {
			onNavigate(currentIndex - 1);
		}
	}

	function goToNext() {
		if (currentIndex < weekStats.length - 1) {
			onNavigate(currentIndex + 1);
		}
	}
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class="h-screen overflow-y-auto sm:max-w-2xl md:max-h-[700px]">
		<Dialog.Header>
			<div class="flex items-center justify-between">
				<Button
					variant="ghost"
					size="icon"
					class="h-10 w-10 rounded-full"
					onclick={goToPrevious}
					disabled={currentIndex == 0}
					aria-label="Previous day"
				>
					<ChevronLeft class="h-5 w-5" />
				</Button>

				<Dialog.Title class="flex items-center gap-2">
					<Calendar class="size-5" />
					{formattedDate}
				</Dialog.Title>

				<Button
					variant="ghost"
					size="icon"
					class="h-10 w-10 rounded-full"
					onclick={goToNext}
					disabled={currentIndex == weekStats.length - 1}
					aria-label="Next day"
				>
					<ChevronRight class="h-5 w-5" />
				</Button>
			</div>
		</Dialog.Header>

		<div class="space-y-6">
			{#if $dayMeasurementsQuery.isLoading}
				<div class="flex flex-col gap-4">
					<Skeleton class="h-[40px] w-full" />
					<Skeleton class="h-[300px] w-full" />
				</div>
			{:else if emptyData}
				<div class="py-6 text-center">
					<p class="text-muted-foreground">No measurements found for this day.</p>
				</div>
			{:else}
				<Tabs.Root value={activeTab} onValueChange={(value) => (activeTab = value)}>
					<Tabs.List class="grid w-full grid-cols-2">
						<Tabs.Trigger value="chart">Charts</Tabs.Trigger>
						<Tabs.Trigger value="table">Table</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="chart" class="pt-4">
						<Accordion.Root value={['temp']} type="multiple" class="w-full">
							<Accordion.Item value="temp">
								<Accordion.Trigger>Temperature</Accordion.Trigger>
								<Accordion.Content>
									<Chart chartData={tempChartData!} lineColor="red" suffix="°C" />
								</Accordion.Content>
							</Accordion.Item>
							<Accordion.Item value="hum">
								<Accordion.Trigger>Humidity</Accordion.Trigger>
								<Accordion.Content>
									<Chart chartData={humChartData!} lineColor="purple" suffix="%" />
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</Tabs.Content>

					<Tabs.Content value="table" class="pt-4">
						{#if $dataQuery.data}
							<Table
								pageNumber={currentPage}
								onPageChange={handlePageChange}
								{dataQuery}
								{emptyData}
							/>
						{/if}
					</Tabs.Content>
				</Tabs.Root>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
