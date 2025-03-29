<script lang="ts">
	import Chart from '@/components/measurements/chart.svelte';
	import Table from '@/components/measurements/table.svelte';
	import * as Accordion from '@/components/ui/accordion';
	import * as Dialog from '@/components/ui/dialog';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Tabs from '@/components/ui/tabs';
	import { api } from '@/shared';
	import type { Measurement } from '@/shared/types';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { Calendar } from 'lucide-svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		date: string;
		stationId: number;
	}

	const { open, onOpenChange, date, stationId }: Props = $props();

	const selectedDate = $derived(dayjs(date));
	const formattedDate = $derived(selectedDate.format('dddd, MMMM D, YYYY'));
	let currentPage = $state(1);

	const dataQuery = $derived(
		createQuery({
			queryKey: ['measurements', stationId!, currentPage, selectedDate],
			queryFn: () => api.getMeasurements(stationId!, currentPage, selectedDate),
			enabled: !!stationId
		})
	);
	const dayMeasurementsQuery = $derived(
		createQuery({
			queryKey: ['dayMeasurements', stationId, selectedDate.format('YYYY-MM-DD')],
			queryFn: () => api.getMeasurements(stationId, 1, selectedDate, 24),
			enabled: open && !!stationId && !!date
		})
	);

	const createChartData = (key: keyof Measurement) =>
		$dayMeasurementsQuery.data?.results.map((data) => ({
			date: new Date(data.timestamp),
			value: data[key]
		}));

	const tempChartData = $derived(createChartData('temperature'));
	const humChartData = $derived(createChartData('humidity'));

	const emptyData = $derived($dataQuery.status == 'success' && $dataQuery.data?.results.length == 0);

	function handlePageChange(page: number) {
		currentPage = page;
	}

	let activeTab = $state('chart');
</script>

<Dialog.Root {open} onOpenChange={onOpenChange}>
	<Dialog.Content class="sm:max-w-2xl h-screen md:max-h-[700px] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Calendar class="size-5" />
				{formattedDate}
			</Dialog.Title>
			<Dialog.Description>
				Daily temperature and humidity measurements
			</Dialog.Description>
		</Dialog.Header>

		<div class="mt-4 space-y-6">
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
