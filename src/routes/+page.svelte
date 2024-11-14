<script lang="ts">
	import { api } from '@/shared/api';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Tabs from '@/components/ui/tabs/index';

	const dataQuery = createQuery({
		queryKey: ['measurements'],
		queryFn: () => api.getMeasurements()
	});
</script>

<Tabs.Root value="table" class="w-full">
	<Tabs.List class="grid w-full grid-cols-2">
		<Tabs.Trigger value="table">Table</Tabs.Trigger>
		<Tabs.Trigger value="graph">Graph</Tabs.Trigger>
	</Tabs.List>
	<main class="grid h-svh items-center justify-center">
		<Tabs.Content value="table">
			{#if $dataQuery.data}
				{#each $dataQuery.data as measurement}
					<div class="grid gap-1">
						<p>{measurement.temperature}</p>
						<p>{measurement.humidity} %</p>
					</div>
				{/each}
			{/if}
		</Tabs.Content>
		<Tabs.Content value="graph">
			<p>graph</p>
		</Tabs.Content>
	</main>
</Tabs.Root>
