<script lang="ts">
	import type { ForecastTransformed } from '@/shared/types';
  import Wind from '@/components/svgs/wind.svelte';
	import Thermometer from '@/components/svgs/thermometer.svelte';

	interface Props {
		forecast: ForecastTransformed;
	}

	const { forecast }: Props = $props();
</script>

<div class="flex flex-col px-8 py-4 rounded-lg border border-border shadow-lg">
  <h2 class="text-lg font-semibold">Current conditions</h2>
  <div class="flex gap-x-6">
    <forecast.icon width={64} height={64} />
    <div class="flex gap-x-2 items-center">
      <Thermometer width={48} height={48} />
      <p class="font-medium text-4xl">{Math.round(forecast.temperature_max)}°</p>
    </div>
    <div class="flex items-center">
      <Wind width={48} height={48} />
      <p class="text-nowrap"><span class="font-medium text-4xl">{Math.floor(forecast.windspeed_mean)}</span> m/s</p>
    </div>
  </div>
</div>
