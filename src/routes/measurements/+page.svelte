<script lang="ts">
	import { page } from '$app/state';
	import Chart from '@/components/measurements/chart.svelte';
	import DeleteDialog from '@/components/measurements/delete-dialog.svelte';
	import Table from '@/components/measurements/table.svelte';
	import * as Accordion from '@/components/ui/accordion';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Tabs from '@/components/ui/tabs';
	import Popover from '@/components/ui/weekday';
	import { api, setParam } from '@/shared';
	import useLocalStorage from '@/shared/runes.svelte';
	import type { Measurement } from '@/shared/types';
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
	const stationId: number = $derived(
		stationIdParam ? parseInt(stationIdParam) : parseInt(defaultStationId.value)
	);

	$effect(() => {
		// If stations are loaded and no station is selected, select the first one
		if ($stationQuery.data?.results.length && !defaultStationId.value) {
			const firstStation = $stationQuery.data.results[0];
			setSelectedStation(firstStation.id);
		}
	});

	const viewParam = $derived(page.url.searchParams.get('view'));
	const pageParam = $derived(parseInt(page.url.searchParams.get('page') || '1') || 1);
	const dateParam = $derived(page.url.searchParams.get('date') || new Date().toISOString());
	const dates = Array.from({ length: 4 }, (_, i) => dayjs().subtract(i, 'day')).reverse();

	const dataQuery = $derived(
		createQuery({
			queryKey: ['measurements', stationId!, pageParam, dateParam],
			queryFn: () => api.getMeasurements(stationId!, pageParam, dayjs(dateParam)),
			enabled: !!stationId
		})
	);

	function setSelectedStation(id: number) {
		defaultStationId.value = id.toString();
		toast.success('Station selected as default');
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

	let deleteDialogOpen = $state(false);

	function refreshData() {}
</script>

{#snippet title(className: string)}
	<div class="flex w-full {className} items-center justify-between">
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
{/snippet}

<div class="w-full space-y-4">
	<Tabs.Root
		value={viewParam ? viewParam : 'table'}
		onValueChange={(value) => setParam('view', value)}
		class="w-full"
	>
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="table">Table</Tabs.Trigger>
			<Tabs.Trigger value="graph">Graph</Tabs.Trigger>
		</Tabs.List>
		<main class="flex h-svh flex-col items-center justify-center">
			{#if $dataQuery.data}
				<Tabs.Content value="table">
					<div class="flex flex-col items-center gap-y-5">
						{@render title('max-w-sm')}
						<Popover {dates} selected={dateParam} />
						{#if !emptyData}
							<Table
								pageNumber={pageParam}
								onPageChange={(page) => setParam('page', page.toString())}
								{dataQuery}
							/>
						{:else}
							<div class="flex w-screen max-w-sm flex-col items-center gap-5">
								<Skeleton class="h-[35px] w-full" />
								<Skeleton class="h-[300px] w-full rounded" />
								<Skeleton class="h-[35px] w-full" />
							</div>
						{/if}
					</div>
				</Tabs.Content>
				<Tabs.Content value="graph">
					<div class="flex flex-col gap-y-5">
						{@render title('max-w-xl')}
						<Popover {dates} selected={dateParam} />
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
					</div>
				</Tabs.Content>
			{/if}
		</main>
	</Tabs.Root>

	<DeleteDialog bind:open={deleteDialogOpen} {stationId} onSuccess={refreshData} />
</div>
