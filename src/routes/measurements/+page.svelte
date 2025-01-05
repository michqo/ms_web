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
	import type { Measurement } from '@/shared/types';

	const pageParam = $derived(page.url.searchParams.get('page'));
	let pageNumber = $derived(pageParam ? parseInt(pageParam) : 1);

	const dataQuery = $derived(
		createQuery({
			queryKey: ['measurements', pageNumber],
			queryFn: () => api.getMeasurements(pageNumber)
		})
	);

	function onPageChange(page: number) {
		goto(`?page=${page}`);
	}
	function onViewChange(view: string) {
		goto(`?view=${view}`);
	}

  function createChartData(key: keyof Measurement) {
    return $dataQuery.data?.results.map((data) => ({
        date: new Date(data.timestamp),
        value: data[key]
    }))
  }

  const tempChartData = $derived(createChartData('temperature'));
  const humChartData = $derived(createChartData('humidity'));

	const viewParam = $derived(page.url.searchParams.get('view'));
  
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
				{#if !emptyData}
					<Table {pageNumber} {onPageChange} {dataQuery} />
				{:else}
					<div class="flex flex-col items-center gap-5">
						<Skeleton class="h-[35px] w-[250px]" />
						<Skeleton class="h-[20px] w-[150px] rounded" />
						<Skeleton class="h-[30px] w-[180px]" />
					</div>
				{/if}
			</Tabs.Content>
			<Tabs.Content value="graph">
        <Accordion.Root value={["temp"]} type="multiple" class="w-screen max-w-2xl">
          <Accordion.Item value="temp">
            <Accordion.Trigger>Temperature</Accordion.Trigger>
            <Accordion.Content>
              <Chart chartData={tempChartData!} />
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="hum">
            <Accordion.Trigger>Humidity</Accordion.Trigger>
            <Accordion.Content>
              <Chart chartData={humChartData!} />
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
			</Tabs.Content>
		{/if}
	</main>
</Tabs.Root>
