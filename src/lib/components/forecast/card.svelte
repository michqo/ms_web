<script lang="ts">
	import type { ForecastTransformed, Measurement } from '@/shared/types';
	import Wind from '@/components/svgs/wind.svelte';
	import Thermometer from '@/components/svgs/thermometer.svelte';
	import { Droplets, Umbrella, Calendar, Gauge, CloudFog } from 'lucide-svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '@/shared';
	import dayjs from 'dayjs';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Tooltip from '@/components/ui/tooltip/index';
	import { t } from '@/translations';

	interface Props {
		forecast: ForecastTransformed;
		stationId: number;
		measurementPreview?: Measurement;
	}

	const { forecast, stationId, measurementPreview }: Props = $props();

	const measurementQuery = createQuery({
		queryKey: ['lastMeasurement', stationId],
		queryFn: () => api.getLatestMeasurement(stationId),
		enabled: !!stationId
	});

	const data = $derived(measurementPreview || $measurementQuery.data);
	const latestMeasurement = $derived(
		data && {
			...data,
			created_at: dayjs(data.created_at),
			temperature: Math.round(data.temperature),
			humidity: Math.round(data.humidity)
		}
	);
</script>

<div class="border-border bg-card flex flex-col rounded-xl border p-5 shadow-sm sm:p-8">
	<div class="mt-2 mb-4 flex items-center justify-center gap-x-2">
		<Calendar class="text-muted-foreground h-4 w-4" />
		<p class="text-muted-foreground text-sm font-medium">{forecast.time.format('dddd, MMMM D')}</p>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
		<div class="flex flex-col items-center">
			<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
				{$t('forecast.card.title')}
			</p>
			<div class="flex items-center justify-center gap-x-4">
				<forecast.icon width={80} height={80} class="sm:h-[100px] sm:w-[100px]" />
				<div class="flex flex-col items-center">
					<p class="text-4xl font-bold sm:text-5xl">{Math.round(forecast.temperature_max)}°</p>
					<span class="text-muted-foreground text-lg sm:text-xl"
						>{Math.round(forecast.temperature_min)}°</span
					>
				</div>
			</div>
		</div>

		<div class="border-t pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
			<p class="text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase">
				{$t('forecast.card.current_temperature')}
			</p>
			{#if $measurementQuery.isLoading}
				<div class="flex h-full min-h-[80px] items-center justify-center">
					<Skeleton class="h-10 w-24" />
				</div>
			{:else if $measurementQuery.isError}
				<div class="flex h-full min-h-[80px] items-center justify-center">
					<p class="text-center text-sm font-medium text-red-500">
						{$t('forecast.card.error_current')}
					</p>
				</div>
			{:else if latestMeasurement}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger class="w-full cursor-default">
							<div class="flex items-center justify-center gap-3 pt-2">
								<Thermometer width={40} height={40} class="sm:h-12 sm:w-12" />
								<p class="text-4xl font-bold sm:text-5xl">{latestMeasurement.temperature}°</p>
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content>
							{$t('forecast.card.last_updated')}: {latestMeasurement.created_at.format('HH:mm:ss')}
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			{:else}
				<div class="flex h-full min-h-[80px] items-center justify-center">
					<p class="text-center text-sm font-medium">{$t('forecast.card.no_current_data')}</p>
				</div>
			{/if}
		</div>
	</div>

	<div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 border-t pt-8 sm:grid-cols-3 sm:gap-4 sm:pt-6">
		<div class="flex flex-col items-center gap-1">
			<Wind width={28} height={28} class="text-muted-foreground" />
			<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
				{$t('forecast.card.wind')}
			</p>
			<p class="text-lg font-bold">
				{Math.floor(forecast.windspeed_mean)} <span class="text-xs font-normal">m/s</span>
			</p>
		</div>

		<div class="flex flex-col items-center gap-1">
			<Droplets class="h-7 w-7 text-blue-500" />
			<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
				{$t('forecast.card.humidity')}
			</p>
			<p class="text-lg font-bold">
				{forecast.relativehumidity_mean}<span class="text-sm font-normal">%</span>
			</p>
		</div>

		<div class="flex flex-col items-center gap-1">
			<Umbrella class="h-7 w-7 text-cyan-500" />
			<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
				{$t('forecast.card.precipitation')}
			</p>
			<p class="text-lg font-bold">
				{forecast.precipitation.toFixed(1)} <span class="text-sm font-normal">mm</span>
			</p>
		</div>

		<div class="flex flex-col items-center gap-1">
			<Gauge class="text-muted-foreground h-6 w-6" />
			<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
				{$t('forecast.card.pressure')}
			</p>
			<p class="text-lg font-bold">
				{Math.round(forecast.sealevelpressure_mean)} <span class="text-xs font-normal">hPa</span>
			</p>
		</div>

		<div class="flex flex-col items-center gap-1">
			<CloudFog class="text-muted-foreground h-6 w-6" />
			<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
				{$t('forecast.card.predictability')}
			</p>
			<p class="text-lg font-bold">
				{forecast.predictability}<span class="text-sm font-normal">%</span>
			</p>
		</div>
	</div>
</div>
