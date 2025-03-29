<script lang="ts">
	import * as Table from '@/components/ui/table';
	import { cn } from '@/utils';
	import type { MeasurementStat } from '@/shared/types';
	import dayjs from 'dayjs';
	import { Calendar, Droplets, Thermometer } from 'lucide-svelte';

	interface Props {
		weekStats: MeasurementStat[];
		onSelectDay: (date: string) => void;
	}

	const { weekStats, onSelectDay }: Props = $props();

	function getTemperatureColor(temp: number): string {
		if (temp <= 0) return 'text-blue-600';
		if (temp <= 10) return 'text-blue-400';
		if (temp <= 20) return 'text-green-500';
		if (temp <= 25) return 'text-yellow-500';
		if (temp <= 30) return 'text-orange-500';
		return 'text-red-600';
	}

	function formatNumber(value: number): string {
		return value.toFixed(2);
	}
</script>

<div class="overflow-hidden rounded-lg border shadow-sm">
	<Table.Root class="w-screen max-w-xl caption-top">
		<Table.Caption class="my-4">
			<div class="flex items-center justify-center gap-2">
				<Calendar class="size-4" />
				<span>Daily Statistics</span>
			</div>
		</Table.Caption>
		<Table.Header class="bg-muted/50">
			<Table.Row>
				<Table.Head class="font-medium">Day</Table.Head>
				<Table.Head class="font-medium">
					<div class="flex items-center gap-2">
						<Thermometer class="size-4" />
						<span>Temperature (°C)</span>
					</div>
				</Table.Head>
				<Table.Head class="font-medium">
					<div class="flex items-center gap-2">
						<Droplets class="size-4" />
						<span>Humidity (%)</span>
					</div>
				</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each weekStats as stat}
				<Table.Row 
					class="hover:bg-muted/30 cursor-pointer" 
					onclick={() => onSelectDay(stat.date)}
				>
					<Table.Cell class="font-medium">{dayjs(stat.date).format('ddd, MMM D')}</Table.Cell>
					<Table.Cell>
						<div class="flex flex-col">
							<span class={cn('font-medium', getTemperatureColor(stat.temperature))}>
									{formatNumber(stat.temperature)}°C
							</span>
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="flex flex-col">
							<span class="font-medium text-blue-500">{formatNumber(stat.humidity)}%</span>
							<div class="h-2 w-full overflow-hidden rounded-full bg-muted mt-1">
								<div
									class="h-full bg-blue-500"
									style={`width: ${stat.humidity}%; opacity: 0.7`}
								></div>
							</div>
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
