<script lang="ts">
	import Pagination from '@/components/Pagination.svelte';
	import * as Table from '@/components/ui/table';
	import type { ListResponse, Measurement } from '@/shared/types';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import type { CreateQueryResult } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { Calendar, Clock, Droplets, Thermometer } from 'lucide-svelte';

	interface Props {
		pageNumber: number;
		onPageChange: (page: number) => void;
		dataQuery: CreateQueryResult<ListResponse<Measurement>, Error>;
		emptyData: boolean;
	}

	const { pageNumber, onPageChange, dataQuery, emptyData }: Props = $props();

	function getTemperatureColor(temp: number): string {
		if (temp <= 0) return 'text-blue-600';
		if (temp <= 10) return 'text-blue-400';
		if (temp <= 20) return 'text-green-500';
		if (temp <= 25) return 'text-yellow-500';
		if (temp <= 30) return 'text-orange-500';
		return 'text-red-600';
	}

	const currentDate = $derived(
		!emptyData
			? $dataQuery.data!.results[0].timestamp.format('dddd, MMMM D, YYYY')
			: 'No data available'
	);
</script>

<div class="mb-5 overflow-hidden rounded-lg border shadow-xs">
	<Table.Root class="caption-top">
		<Table.Caption class="my-4">
			<div class="flex items-center justify-center gap-2">
				<Calendar class="size-4" />
				<span>{currentDate}</span>
			</div>
		</Table.Caption>
		<Table.Header class="bg-muted/50">
			<Table.Row>
				<Table.Head class="font-medium">
					<div class="flex items-center gap-2">
						<Clock class="size-4" />
						<span>{$t('measurements.table.time')}</span>
					</div>
				</Table.Head>
				<Table.Head class="font-medium">
					<div class="flex items-center gap-2">
						<Thermometer class="size-4" />
						<span>{$t('measurements.table.temperature')}</span>
					</div>
				</Table.Head>
				<Table.Head class="font-medium">
					<div class="flex items-center gap-2">
						<Droplets class="size-4" />
						<span>{$t('measurements.table.humidity')}</span>
					</div>
				</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $dataQuery.data!.results as measurement}
				<Table.Row class="hover:bg-muted/30">
					<Table.Cell class="font-medium">
						{measurement.timestamp.format('HH')}:00
					</Table.Cell>
					<Table.Cell>
						<span class={cn('text-lg font-medium', getTemperatureColor(measurement.temperature))}>
							{measurement.temperature}°C
						</span>
					</Table.Cell>
					<Table.Cell>
						<div class="flex items-center gap-1">
							<span class="text-blue-500">
								{measurement.humidity}%
							</span>
							<div class="h-2 w-10 overflow-hidden rounded-full bg-muted">
								<div
									class="h-full bg-blue-500"
									style={`width: ${measurement.humidity}%; opacity: 0.7`}
								></div>
							</div>
						</div></Table.Cell
					>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
<Pagination page={pageNumber} count={$dataQuery.data!.count} {onPageChange} />
