<script lang="ts">
	import * as Card from '@/components/ui/card';
	import { Skeleton } from '@/components/ui/skeleton';
	import type { Measurement, MeasurementStat } from '@/shared/types';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import dayjs from 'dayjs';
	import { Calendar, Clock, Droplets, Thermometer } from 'lucide-svelte';

	interface Props {
		todayStat?: MeasurementStat;
		latestMeasurement?: Measurement;
		isLoading: boolean;
		handleLastDay?: () => void;
	}

	const { todayStat, latestMeasurement, isLoading, handleLastDay }: Props = $props();

	function getTemperatureColor(temp: number): string {
		if (temp <= 0) return 'text-chart-1';
		if (temp <= 15) return 'text-chart-2';
		if (temp <= 25) return 'text-primary';
		if (temp <= 32) return 'text-chart-4';
		return 'text-destructive';
	}
</script>

<Card.Root
	class={[
		'w-full max-w-xl',
		{
			'cursor-pointer': handleLastDay,
			'cursor-default': !handleLastDay
		}
	]}
	onclick={() => todayStat && handleLastDay && handleLastDay()}
>
	<Card.Header class="pb-2">
		<Card.Title class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Calendar class="size-5" />
				<span>{$t('measurements.current_day.caption')}</span>
			</div>
			<span class="text-muted-foreground text-sm font-normal">
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
				<p class="text-muted-foreground">{$t('measurements.current_day.noData')}</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<h3 class="text-muted-foreground text-sm font-medium">
						{$t('measurements.current_day.label')}
					</h3>
					<div class="flex items-center gap-2">
						<Thermometer class="text-primary size-4" />
						<span class={cn('text-lg font-semibold', getTemperatureColor(todayStat.temperature))}>
							{todayStat.temperature}°C
						</span>
					</div>
					<div class="flex items-center gap-2">
						<Droplets class="text-primary size-4" />
						<span class="text-primary text-lg font-semibold">
							{todayStat.humidity}%
						</span>
					</div>
				</div>

				{#if latestMeasurement}
					<div class="space-y-2">
						<h3 class="text-muted-foreground flex items-center gap-1 text-sm font-medium">
							<Clock class="size-3" />
							{$t('measurements.current_day.latest')} ({latestMeasurement.timestamp.format(
								'HH:mm'
							)})
						</h3>
						<div class="flex items-center gap-2">
							<Thermometer class="text-primary size-4" />
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
							<Droplets class="text-primary size-4" />
							<span class="text-primary text-lg font-semibold">
								{latestMeasurement.humidity}%
							</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
