<script lang="ts">
	import type { ForecastTransformed } from '@/shared/types';
	import Wind from '@/components/svgs/wind.svelte';
	import { Droplets, Umbrella, Gauge, CloudFog, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { Button } from '../ui/button';
	import { t } from '@/translations';
	import { globalState } from '@/shared/runes.svelte';

	interface Props {
		forecast: ForecastTransformed;
		allForecasts: ForecastTransformed[];
		currentIndex: number;
		onNavigate: (index: number) => void;
	}

	const { forecast, allForecasts, currentIndex, onNavigate }: Props = $props();

	function goToPrevious() {
		if (currentIndex > 0) {
			onNavigate(currentIndex - 1);
		}
	}

	function goToNext() {
		if (currentIndex < allForecasts.length - 1) {
			onNavigate(currentIndex + 1);
		}
	}
</script>

<div class="flex flex-col items-center">
	<div class="mb-6 flex w-full items-center justify-between">
		<Button
			variant="ghost"
			size="icon"
			class="h-12 w-12 rounded-full"
			onclick={goToPrevious}
			disabled={currentIndex == 0}
			aria-label={$t('forecast.table.dialog.previous')}
		>
			<ChevronLeft class="h-6 w-6" />
		</Button>

		<div class="flex w-full items-center justify-center gap-4 sm:gap-8">
			<forecast.icon
				width={globalState.isMobile.value ? 70 : 100}
				height={globalState.isMobile.value ? 70 : 100}
			/>
			<div class="flex flex-col items-center gap-2 sm:flex-row">
				<span class="text-3xl font-medium sm:text-5xl">{Math.round(forecast.temperature_max)}°</span
				>
				<span class="text-muted-foreground text-xl sm:text-2xl"
					>{Math.round(forecast.temperature_min)}°</span
				>
			</div>
		</div>

		<Button
			variant="ghost"
			size="icon"
			class="h-12 w-12 rounded-full"
			onclick={goToNext}
			disabled={currentIndex == allForecasts.length - 1}
			aria-label={$t('forecast.table.dialog.previous')}
		>
			<ChevronRight class="h-6 w-6" />
		</Button>
	</div>

	<div class="flex w-full flex-wrap justify-around gap-4 border-t pt-6">
		<div class="flex flex-col items-center">
			<Wind width={28} height={28} />
			<p class="text-muted-foreground mt-1 text-sm">{$t('forecast.card.wind')}</p>
			<p class="font-medium">{Math.floor(forecast.windspeed_mean)} m/s</p>
		</div>

		<div class="flex flex-col items-center">
			<Droplets class="h-7 w-7" />
			<p class="text-muted-foreground mt-1 text-sm">{$t('forecast.card.humidity')}</p>
			<p class="font-medium">{forecast.relativehumidity_mean}%</p>
		</div>

		<div class="flex flex-col items-center">
			<Umbrella class="h-7 w-7" />
			<p class="text-muted-foreground mt-1 text-sm">{$t('forecast.card.precipitation')}</p>
			<p class="font-medium">{forecast.precipitation} mm</p>
		</div>
	</div>

	<div class="mt-6 flex flex-wrap justify-around gap-4">
		<div class="flex flex-col items-center">
			<Gauge class="h-5 w-5" />
			<span class="text-muted-foreground text-sm">{$t('forecast.card.pressure')}</span>
			<span class="font-medium">{Math.round(forecast.sealevelpressure_mean)} hPa</span>
		</div>

		<div class="flex flex-col items-center">
			<CloudFog class="h-5 w-5" />
			<span class="text-muted-foreground text-sm">{$t('forecast.card.predictability')}</span>
			<span class="font-medium">{forecast.predictability}%</span>
		</div>
	</div>
</div>
