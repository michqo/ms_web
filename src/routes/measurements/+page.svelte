<script lang="ts">
	import { api } from '@/shared/api';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Tabs from '@/components/ui/tabs';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Accordion from '@/components/ui/accordion'; 
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Table from '@/components/measurements/table.svelte';
	import Chart from '@/components/measurements/chart.svelte';
	import Popover from '@/components/ui/weekday';
	import type { Measurement } from '@/shared/types';
	import dayjs from 'dayjs';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	const queryParams = new SvelteURLSearchParams();

	const viewParam = $derived(page.url.searchParams.get('view'));
	const pageParam = $derived(parseInt(page.url.searchParams.get('page') || '1') || 1);
	const dateParam = $derived(page.url.searchParams.get('date') || new Date().toISOString());
	const dates = Array.from({ length: 4 }, (_, i) => dayjs().subtract(i, 'day')).reverse();

	const dataQuery = $derived(
		createQuery({
			queryKey: ['measurements', pageParam, dateParam],
			queryFn: () => api.getMeasurements(pageParam, dayjs(dateParam))
		})
	);

	function onPageChange(pageNumber: number) {
		queryParams.set('page', pageNumber.toString());
		goto(`?${queryParams.toString()}`);
	}
	function onViewChange(view: string) {
		queryParams.set('view', view);
		goto(`?${queryParams.toString()}`);
	}

	const createChartData = (key: keyof Measurement) =>
		$dataQuery.data?.results.map((data) => ({
			date: new Date(data.timestamp),
			value: data[key]
		}));

	const tempChartData = $derived(createChartData('temperature'));
	const humChartData = $derived(createChartData('humidity'));

	const emptyData = $derived($dataQuery.status == 'success' && $dataQuery.data.results.length == 0);
	
	$effect(() => {
		if (emptyData) {
			toast.error('No measurements found.');
		}
	});
</script>

<Tabs.Root value={viewParam ? viewParam : 'table'} onValueChange={onViewChange} class="w-full">
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="table">Table</Tabs.Trigger>
		<Tabs.Trigger value="graph">Graph</Tabs.Trigger>
	</Tabs.List>
	<main class="grid h-svh items-center justify-center">
		{#if $dataQuery.data}
			<Tabs.Content value="table">
				<Popover {dates} selected={dateParam} params={queryParams} />
				{#if !emptyData}
					<Table pageNumber={pageParam} {onPageChange} {dataQuery} />
				{:else}
					<div class="flex w-screen max-w-sm flex-col items-center gap-5">
						<Skeleton class="h-[35px] w-full" />
						<Skeleton class="h-[300px] w-full rounded" />
						<Skeleton class="h-[35px] w-full" />
					</div>
				{/if}
			</Tabs.Content>
			<Tabs.Content value="graph">
				{#if !emptyData}
					<Accordion.Root value={['temp']} type="multiple" class="w-screen max-w-xl">
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
				{:else}
					<div class="flex w-screen max-w-xl flex-col items-center gap-5">
						<Skeleton class="h-[40px] w-full" />
						<Skeleton class="h-[40px] w-full" />
					</div>
				{/if}
			</Tabs.Content>
		{/if}
	</main>
</Tabs.Root>
