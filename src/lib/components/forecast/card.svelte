<script lang="ts">
  import * as Table from '@/components/ui/table';
	import type { ForecastBase } from '@/shared/types';
	import dayjs from 'dayjs';

	interface Props {
		forecast: ForecastBase;
	}

	const { forecast }: Props = $props();

  const displayTime = forecast.time.isSame(dayjs(), 'day')
    ? 'Today'
    : forecast.time.isSame(dayjs().add(1, 'day'), 'day')
    ? 'Tomorrow'
    : forecast.time.format('ddd');
</script>

<div class="flex flex-col w-24 p-4 rounded-lg bg-accent shadow-lg">
  <h2 class="text-xl font-semibold">{forecast.time.format('ddd')}</h2>
  <p class="text-sm text-gray-500">{displayTime}</p>
  <div class="mt-5 flex justify-around">
    <p>{Math.round(forecast.temperature_max)}°</p>
    <p class="text-muted-foreground">{Math.round(forecast.temperature_min)}°</p>
  </div>
</div>
