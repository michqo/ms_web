<script lang="ts">
	import * as Dialog from '@/components/ui/dialog';
	import * as Table from '@/components/ui/table';
	import type { ForecastBase, ForecastTransformed } from '@/shared/types';
	import dayjs, { type Dayjs } from 'dayjs';
	import DialogCard from './dialog-card.svelte';
	import { t } from '@/translations';

	interface Props {
		forecast: ForecastTransformed[];
		updatedDate: Dayjs;
	}

	const { forecast, updatedDate }: Props = $props();

	let selectedForecast: ForecastTransformed | null = $state(null);
	let selectedIndex: number = $state(0);
	let dialogOpen = $state(false);

	const displayTime = (item: ForecastBase) =>
		item.time.isSame(dayjs(), 'day') ? $t('forecast.table.today') : item.time.format('ddd');

	function handleRowClick(item: ForecastTransformed) {
		selectedIndex = forecast.findIndex((f) => f === item);
		selectedForecast = item;
		dialogOpen = true;
	}

	function handleNavigate(index: number) {
		selectedIndex = index;
		selectedForecast = forecast[index];
	}
</script>

<div class="my-10 w-full overflow-hidden rounded-lg border shadow-xs">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">{$t('forecast.table.header.day')}</Table.Head>
				<Table.Head>{$t('forecast.table.header.weather')}</Table.Head>
				<Table.Head>{$t('forecast.table.header.high')}</Table.Head>
				<Table.Head>{$t('forecast.table.header.low')}</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each forecast as item, i}
				<Table.Row
					class="hover:bg-muted/50 transition-colors {i == 0 ? 'bg-muted/20' : ''} cursor-pointer"
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
				<Table.Cell colspan={4} class="text-muted-foreground py-2 text-center text-xs">
					{$t('forecast.table.updated')}
					{updatedDate.format('MMM D, HH:mm')}
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
			<Dialog.Description>{$t('forecast.table.dialog.description')}</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			{#if selectedForecast}
				<DialogCard
					forecast={selectedForecast}
					allForecasts={forecast}
					currentIndex={selectedIndex}
					onNavigate={handleNavigate}
				/>
			{/if}
		</div>

		<Dialog.Footer>
			<Dialog.Close>{$t('forecast.table.dialog.close')}</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
