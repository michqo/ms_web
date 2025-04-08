<script lang="ts">
	import * as Card from '@/components/ui/card';
	import { Skeleton } from '@/components/ui/skeleton';
	import type { Measurement, MeasurementStat } from '@/shared/types';
	import { cn } from '@/utils';
	import dayjs from 'dayjs';
	import { Calendar, Clock, Droplets, Thermometer } from 'lucide-svelte';

	interface Props {
		todayStat?: MeasurementStat;
		latestMeasurement?: Measurement;
		isLoading: boolean;
		handleLastDay: () => void;
	}

	const { todayStat, latestMeasurement, isLoading, handleLastDay }: Props = $props();

	function getTemperatureColor(temp: number): string {
		if (temp <= 0) return 'text-blue-600';
		if (temp <= 10) return 'text-blue-400';
		if (temp <= 20) return 'text-green-500';
		if (temp <= 25) return 'text-yellow-500';
		if (temp <= 30) return 'text-orange-500';
		return 'text-red-600';
	}

	function formatNumber(value: number): string {
		return value?.toFixed(2);
	}
</script>

<Card.Root
	class="w-full max-w-xl cursor-pointer transition-colors hover:bg-muted/10"
	onclick={() => todayStat && handleLastDay()}
>
	<Card.Header class="pb-2">
		<Card.Title class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Calendar class="size-5" />
				<span>Today's Stats</span>
			</div>
			<span class="text-sm font-normal text-muted-foreground">
				{dayjs().format('dddd, MMMM D')}
			</span>
		</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if isLoading}
			<div class="space-y-4">
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-16 w-full" />
			</div>
		{:else if !todayStat}
			<div class="flex h-24 items-center justify-center">
				<p class="text-muted-foreground">No data available for today</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<h3 class="text-sm font-medium text-muted-foreground">Daily Averages</h3>
					<div class="flex items-center gap-2">
						<Thermometer class="size-4 text-primary" />
						<span class={cn('text-lg font-semibold', getTemperatureColor(todayStat.temperature))}>
							{formatNumber(todayStat.temperature)}°C
						</span>
					</div>
					<div class="flex items-center gap-2">
						<Droplets class="size-4 text-blue-500" />
						<span class="text-lg font-semibold text-blue-500">
							{formatNumber(todayStat.humidity)}%
						</span>
					</div>
				</div>

				{#if latestMeasurement}
					<div class="space-y-2">
						<h3 class="flex items-center gap-1 text-sm font-medium text-muted-foreground">
							<Clock class="size-3" />
							Latest ({dayjs(latestMeasurement.timestamp).format('HH:mm')})
						</h3>
						<div class="flex items-center gap-2">
							<Thermometer class="size-4 text-primary" />
							<span
								class={cn(
									'text-lg font-semibold',
									getTemperatureColor(latestMeasurement.temperature)
								)}
							>
								{latestMeasurement.temperature}°C
							</span>
						</div>
						<div class="flex items-center gap-2">
							<Droplets class="size-4 text-blue-500" />
							<span class="text-lg font-semibold text-blue-500">
								{latestMeasurement.humidity}%
							</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
