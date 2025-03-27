<script lang="ts">
	import * as Table from '@/components/ui/table';
	import type { ForecastBase, ForecastTransformed } from '@/shared/types';
	import dayjs from 'dayjs';
	import * as Dialog from '@/components/ui/dialog';
	import DialogCard from './dialog-card.svelte';

	interface Props {
		forecast: ForecastTransformed[];
		updatedDate: string;
	}

	const { forecast, updatedDate }: Props = $props();

	let selectedForecast: ForecastTransformed | null = $state(null);
	let dialogOpen = $state(false);

	const displayTime = (item: ForecastBase) =>
		item.time.isSame(dayjs(), 'day') ? 'Today' : item.time.format('ddd');

	function handleRowClick(item: ForecastTransformed) {
		selectedForecast = item;
		dialogOpen = true;
	}
</script>

<div class="w-full overflow-hidden rounded-lg border shadow-sm">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">Day</Table.Head>
				<Table.Head>Weather</Table.Head>
				<Table.Head>High</Table.Head>
				<Table.Head>Low</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each forecast as item, i}
				<Table.Row
					class="transition-colors hover:bg-muted/50 {i == 0 ? 'bg-muted/20' : ''} cursor-pointer"
					onclick={() => handleRowClick(item)}
				>
					<Table.Cell class="font-medium">{displayTime(item)}</Table.Cell>
					<Table.Cell>
						<item.icon class="h-10 w-10" />
					</Table.Cell>
					<Table.Cell class="text-base font-semibold text-red-500">
						{Math.round(item.temperature_max)}°
					</Table.Cell>
					<Table.Cell class="text-base text-blue-500">
						{Math.round(item.temperature_min)}°
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
		<Table.Footer>
			<Table.Row>
				<Table.Cell colspan={4} class="py-2 text-center text-xs text-muted-foreground">
					Updated {dayjs(updatedDate).format('MMM D, HH:mm')}
				</Table.Cell>
			</Table.Row>
		</Table.Footer>
	</Table.Root>
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>
				{selectedForecast?.time.format('dddd, MMMM D')}
			</Dialog.Title>
			<Dialog.Description>Forecast details</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<DialogCard forecast={selectedForecast!} />
		</div>

		<Dialog.Footer>
			<Dialog.Close>Close</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
