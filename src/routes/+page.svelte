<script lang="ts">
	import { api } from '@/shared/api';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Tabs from '@/components/ui/tabs';
	import {Skeleton} from '@/components/ui/skeleton';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Table from '@/components/measurements/table.svelte';

	const pageParam = $derived(page.url.searchParams.get('page'));
	let pageNumber = $derived(pageParam ? parseInt(pageParam) : 1);

	const dataQuery = $derived(createQuery({
		queryKey: ['measurements', pageNumber],
		queryFn: () => api.getMeasurements(pageNumber)
	}));

	function onPageChange(page: number) {
		goto(`?page=${page}`);
	}

	const emptyData = $derived($dataQuery.status == 'success' && $dataQuery.data.results.length == 0);
	
	$effect(() => {
		if (emptyData) {
			toast.error('No measurements found.');
		}
	})
</script>

<Tabs.Root value="table" class="w-full">
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="table">Table</Tabs.Trigger>
		<Tabs.Trigger value="graph">Graph</Tabs.Trigger>
	</Tabs.List>
	<main class="grid h-svh items-center justify-center">
		<Tabs.Content value="table">
			{#if $dataQuery.data}
				{#if !emptyData}
					<Table {pageNumber} {onPageChange} {dataQuery} />
				{:else}
					<div class="flex flex-col items-center gap-5">
						<Skeleton class="h-[35px] w-[250px]" />
						<Skeleton class="h-[20px] w-[150px] rounded" />
						<Skeleton class="h-[30px] w-[180px]" />
					</div>
				{/if}
			{/if}
		</Tabs.Content>
		<Tabs.Content value="graph">
			<p>TODO: graph</p>
		</Tabs.Content>
	</main>
</Tabs.Root>
