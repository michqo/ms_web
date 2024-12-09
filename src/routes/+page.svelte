<script lang="ts">
	import { api } from '@/shared/api';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Tabs from '@/components/ui/tabs';
	import * as Table from '@/components/ui/table';
	import dayjs from 'dayjs';

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
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Cell>Time</Table.Cell>
							<Table.Cell>Temperature</Table.Cell>
							<Table.Cell>Humidity</Table.Cell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each $dataQuery.data as measurement}
							<Table.Row>
								<Table.Cell>{dayjs(measurement.timestamp).format("DD.MM.YYYY HH:mm")}</Table.Cell>
								<Table.Cell>{measurement.temperature}</Table.Cell>
								<Table.Cell>{measurement.humidity}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Tabs.Content>
		<Tabs.Content value="graph">
			<p>TODO: graph</p>
		</Tabs.Content>
	</main>
</Tabs.Root>
