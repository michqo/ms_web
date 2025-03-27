<script lang="ts">
	import type { ForecastTransformed } from '@/shared/types';
	import Wind from '@/components/svgs/wind.svelte';
	import Thermometer from '@/components/svgs/thermometer.svelte';
	import { Droplets, Umbrella, Calendar, Gauge, CloudFog } from 'lucide-svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '@/shared';
	import dayjs from 'dayjs';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Tooltip from '@/components/ui/tooltip/index';

	interface Props {
		forecast: ForecastTransformed;
		stationId: number;
	}

	const { forecast, stationId }: Props = $props();

	const measurementQuery = createQuery({
		queryKey: ['lastMeasurement', stationId],
		queryFn: () => api.getLatestMeasurement(stationId),
		enabled: !!stationId
	});

	const latestMeasurement = $derived($measurementQuery.data);
</script>

<div class="flex flex-col rounded-lg border border-border px-8 py-6 shadow-lg">
	<div class="mb-4 gap-x-2 flex items-center justify-center">
		<Calendar class="inline h-4 w-4" />
		<p class="text-sm text-muted-foreground">{forecast.time.format('MMM D, YYYY')}</p>
	</div>

	<div class="grid grid-cols-2 gap-4">
    <div class="flex flex-col">
      <p class="text-center text-sm text-muted-foreground">Forecast</p>
      <div class="flex items-center justify-center gap-x-2">
        <forecast.icon width={100} height={100} />
        <div class="flex flex-col items-center">
          <p class="text-4xl font-medium">{Math.round(forecast.temperature_max)}°</p>
          <div class="flex items-center">
            <span class="text-base text-muted-foreground"
              >{Math.round(forecast.temperature_min)}°</span
            >
          </div>
        </div>
      </div>
    </div>

		<div class="border-l pl-4">
			<p class="text-center text-sm text-muted-foreground">Current Temperature</p>
			{#if $measurementQuery.isLoading}
				<div class="flex items-center justify-center">
					<Skeleton class="h-10 w-20" />
				</div>
			{:else if $measurementQuery.isError}
				<p class="text-center text-red-500">Failed to load current data</p>
			{:else if latestMeasurement}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<div class="flex items-center justify-center">
								<Thermometer width={32} height={32} />
								<p class="ml-2 text-4xl font-medium">
									{Math.round(latestMeasurement.temperature)}°
								</p>
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content>
							Last updated: {dayjs(latestMeasurement.created_at).format('MMM D, YYYY HH:mm:ss')}
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			{:else}
				<p class="text-center text-sm">No current data available</p>
			{/if}
		</div>
	</div>

	<div class="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
		<div class="flex flex-col items-center">
			<Wind width={28} height={28} />
			<p class="mt-1 text-sm text-muted-foreground">Wind</p>
			<p class="font-medium">{Math.floor(forecast.windspeed_mean)} m/s</p>
		</div>

		<div class="flex flex-col items-center">
			<Droplets class="h-7 w-7" />
			<p class="mt-1 text-sm text-muted-foreground">Humidity</p>
			<p class="font-medium">{forecast.relativehumidity_mean}%</p>
		</div>

		<div class="flex flex-col items-center">
			<Umbrella class="h-7 w-7" />
			<p class="mt-1 text-sm text-muted-foreground">Precipitation</p>
			<p class="font-medium">{forecast.precipitation} mm</p>
		</div>
	</div>

	<div class="mt-4 grid grid-cols-2 gap-4">
		<div class="flex flex-col items-center">
			<Gauge class="h-5 w-5" />
			<span class="text-sm text-muted-foreground">Pressure</span>
			<span class="font-medium">{Math.round(forecast.sealevelpressure_mean)} hPa</span>
		</div>

		<div class="flex flex-col items-center">
			<CloudFog class="h-5 w-5" />
			<span class="text-sm text-muted-foreground">Predictability</span>
			<span class="font-medium">{forecast.predictability}%</span>
		</div>
	</div>
</div>
