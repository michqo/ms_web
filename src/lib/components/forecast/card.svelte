<script lang="ts">
	import type { ForecastBase } from '@/shared/types';
	import dayjs from 'dayjs';

	interface Props {
		forecast: ForecastBase;
	}

	const { forecast }: Props = $props();
</script>

<div class="p-4 rounded-lg bg-accent shadow-lg">
	<h2 class="text-2xl font-semibold">{dayjs(forecast.time).format('ddd')}</h2>
	<p class="text-lg">{forecast.temperature_instant}°C</p>
</div>
