<script lang="ts">
	import { t, locale } from '@/translations';
	import { formatReading } from '@/shared/weather';
	import type { MeasurementStat } from '@/shared/types';
	let { rows, onSelect }: { rows: MeasurementStat[]; onSelect: (day: string) => void } = $props();
</script>

<div class="weather-table-wrap">
	<table class="weather-table">
		<caption class="sr-only">{$t('weather.dailyMean')} · UTC</caption><thead
			><tr
				><th scope="col">{$t('weather.date')} (UTC)</th><th scope="col"
					>{$t('weather.temperature')} (°C)</th
				><th scope="col">{$t('weather.humidity')} (%)</th><th scope="col"
					><span class="sr-only">{$t('weather.openDay')}</span></th
				></tr
			></thead
		><tbody>
			{#each [...rows].reverse() as row}<tr
					><th scope="row">{row.date.locale($locale).format('D MMM YYYY')}</th><td
						>{formatReading(row.temperature, $locale)}</td
					><td>{formatReading(row.humidity, $locale)}</td><td
						><button
							class="weather-button table-action"
							onclick={() => onSelect(row.date.format('YYYY-MM-DD'))}
							>{$t('weather.openDay')}<span class="sr-only">
								· {row.date.format('YYYY-MM-DD')}</span
							></button
						></td
					></tr
				>{/each}
		</tbody>
	</table>
</div>
