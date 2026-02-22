<script lang="ts">
	import Chart from '@/components/measurements/chart.svelte';
	import Table from '@/components/measurements/table.svelte';
	import * as Accordion from '@/components/ui/accordion';
	import { Button, buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Tabs from '@/components/ui/tabs';
	import { api } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import type { ListResponse, Measurement, MeasurementStat } from '@/shared/types';
	import { t } from '@/translations';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs, { type Dayjs } from 'dayjs';
	import { Calendar, ChevronLeft, ChevronRight, Maximize, Minimize, X } from 'lucide-svelte';

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

	function onOpenChangeComplete(open: boolean) {
		if (!open) {
			isMaximized = false;
		}
	}

	let isMaximized = $state(false);
</script>

<Dialog.Root {open} {onOpenChange} {onOpenChangeComplete}>
	<Dialog.MobileContent
		class={[
			'[&>button]:hidden',
			{ 'h-[100vh] max-h-screen! w-screen! max-w-none! rounded-none border-0': isMaximized },
			{ 'sm:max-h-[90vh]': !isMaximized }
		]}
	>
		<Dialog.Header class="flex flex-row items-center justify-between">
			<Button
				variant="ghost"
				size="icon"
				onclick={goToPrevious}
				disabled={currentIndex == 0}
				aria-label={$t('measurements.dialog.previous')}
			>
				<ChevronLeft class="size-4" />
			</Button>

			<Dialog.Title class="flex items-center gap-2">
				<Calendar class="size-4" />
				{formattedDate}
			</Dialog.Title>

			<div class="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onclick={goToNext}
					disabled={currentIndex == weekStats.length - 1}
					aria-label={$t('measurements.dialog.next')}
				>
					<ChevronRight class="size-4" />
				</Button>

				<div class="flex gap-2">
					{#if !globalState.isMobile.value}
						<Button variant="ghost" size="icon" onclick={() => (isMaximized = !isMaximized)}>
							{#if isMaximized}
								<Minimize class="size-4" />
							{:else}
								<Maximize class="size-4" />
							{/if}
						</Button>
					{/if}

					<Dialog.Close class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
						<X class="size-4" />
					</Dialog.Close>
				</div>
			</div>
		</Dialog.Header>

		<div class="space-y-6 overflow-y-auto">
			{#if $dayMeasurementsQuery.isLoading}
				<div class="flex flex-col gap-4">
					<Skeleton class="h-[40px] w-full" />
					<Skeleton class="h-[300px] w-full" />
				</div>
			{:else if emptyData}
				<div class="py-6 text-center">
					<p class="text-muted-foreground">{$t('measurements.dialog.day.noData')}</p>
				</div>
			{:else}
				<Tabs.Root value={activeTab} onValueChange={(value) => (activeTab = value)}>
					<Tabs.List class="bg-background sticky top-0 z-10 grid w-full grid-cols-2">
						<Tabs.Trigger value="chart">{$t('measurements.dialog.day.tabs_chart')}</Tabs.Trigger>
						<Tabs.Trigger value="table">{$t('measurements.dialog.day.tabs_table')}</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="chart" class="pt-4">
						<Accordion.Root
							value={isMaximized ? ['temp', 'hum'] : ['temp']}
							type="multiple"
							class="w-full"
						>
							<Accordion.Item value="temp">
								<Accordion.Trigger
									>{$t('measurements.dialog.day.tabs_chart_temperature')}</Accordion.Trigger
								>
								<Accordion.Content>
									<Chart chartData={tempChartData!} lineColor="red" suffix="°C" />
								</Accordion.Content>
							</Accordion.Item>
							<Accordion.Item value="hum">
								<Accordion.Trigger
									>{$t('measurements.dialog.day.tabs_chart_humidity')}</Accordion.Trigger
								>
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
	</Dialog.MobileContent>
</Dialog.Root>
