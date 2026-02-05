<script lang="ts">
	import type { ForecastTransformed } from '@/shared/types';
	import { CloudRain, Droplets, Thermometer } from 'lucide-svelte';

	interface Props {
		forecast: ForecastTransformed;
	}
	const { forecast }: Props = $props();
</script>

<div class="flex items-center justify-between rounded-lg border p-4">
	<div class="flex items-center gap-4">
		<forecast.icon width={100} height={100} />
		<div>
			<p class="text-lg">
				<span class="font-semibold">{Math.round(forecast.temperature_max)}°</span>
				<span class="text-muted-foreground">/ {Math.round(forecast.temperature_min)}°</span>
			</p>
		</div>
	</div>

	<div class="flex gap-4 text-sm">
		<div class="flex items-center gap-1.5">
			<Thermometer class="text-primary size-4" />
			<span>{forecast.temperature_mean.toFixed(0)}°C</span>
		</div>
		<div class="flex items-center gap-1.5">
			<Droplets class="size-4 text-blue-500" />
			<span>{forecast.relativehumidity_mean.toFixed(0)}%</span>
		</div>
		<div class="flex items-center gap-1.5">
			<CloudRain class="size-4 text-cyan-500" />
			<span>{forecast.precipitation.toFixed(1)}mm</span>
		</div>
	</div>
</div>
