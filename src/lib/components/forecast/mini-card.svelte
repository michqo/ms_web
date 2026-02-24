<script lang="ts">
	import type { ForecastTransformed } from '@/shared/types';
	import { CloudRain, Droplets, Thermometer } from 'lucide-svelte';

	interface Props {
		forecast: ForecastTransformed;
	}
	const { forecast }: Props = $props();
</script>

<div
	class="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
>
	<div class="flex items-center justify-between sm:justify-start sm:gap-6">
		<div class="flex items-center gap-3">
			<forecast.icon width={60} height={60} class="sm:h-[80px] sm:w-[80px]" />
			<div class="flex flex-col -space-y-1 sm:space-y-0">
				<p class="text-2xl font-bold sm:text-3xl">
					{Math.round(forecast.temperature_max)}°
				</p>
				<p class="text-muted-foreground text-sm font-medium sm:text-base">
					{Math.round(forecast.temperature_min)}°
				</p>
			</div>
		</div>

		<!-- Show the daily summary text if needed or just space on mobile -->
	</div>

	<div class="grid grid-cols-3 gap-2 border-t pt-4 sm:flex sm:gap-6 sm:border-t-0 sm:pt-0">
		<div class="flex flex-col items-center gap-1 sm:flex-row sm:gap-1.5">
			<div class="rounded-full bg-orange-500/10 p-1.5 sm:bg-transparent sm:p-0">
				<Thermometer class="size-4 text-orange-500 sm:size-5" />
			</div>
			<span class="text-sm font-bold sm:text-base">{forecast.temperature_mean.toFixed(0)}°</span>
		</div>

		<div class="flex flex-col items-center gap-1 sm:flex-row sm:gap-1.5">
			<div class="rounded-full bg-blue-500/10 p-1.5 sm:bg-transparent sm:p-0">
				<Droplets class="size-4 text-blue-500 sm:size-5" />
			</div>
			<span class="text-sm font-bold sm:text-base"
				>{forecast.relativehumidity_mean.toFixed(0)}%</span
			>
		</div>

		<div class="flex flex-col items-center gap-1 sm:flex-row sm:gap-1.5">
			<div class="rounded-full bg-cyan-500/10 p-1.5 sm:bg-transparent sm:p-0">
				<CloudRain class="size-4 text-cyan-600 sm:size-5 dark:text-cyan-400" />
			</div>
			<span class="text-sm font-bold sm:text-base"
				>{forecast.precipitation.toFixed(1)}<span class="text-[10px] font-normal sm:text-xs"
					>mm</span
				></span
			>
		</div>
	</div>
</div>
