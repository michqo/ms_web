<script lang="ts">
	import { t, locale } from '@/translations';
	import type { ChartData } from '@/shared/types';
	import type { Metric } from '@/shared/weather';
	import { formatReading } from '@/shared/weather';
	import StatsChart from '@/components/measurements/stats-chart.svelte';
	let {
		data,
		metric,
		intraday = false,
		pending,
		error,
		invalid = false,
		onRetry
	}: {
		data: ChartData[];
		metric: Metric;
		intraday?: boolean;
		pending: boolean;
		error: boolean;
		invalid?: boolean;
		onRetry: () => void;
	} = $props();
	const values = $derived(data.map((d) => Number(d.value)));
	const unit = $derived(metric === 'temperature' ? '°C' : '%');
</script>

<div class="trend-content" aria-busy={pending}>
	<p class="chart-caption">
		{$t(intraday ? 'weather.intraday' : 'weather.dailyMean')} · {$t(`weather.${metric}`)} ({unit}) ·
		UTC
	</p>
	{#if !invalid}
		{#if pending && !data.length}<p class="state-message">{$t('weather.loading')}</p>
		{:else if error && !data.length}<div class="state-message" role="alert">
				<p>{$t('weather.historyError')}</p>
				<button class="weather-button" onclick={onRetry}>{$t('weather.retry')}</button>
			</div>
		{:else if data.length}
			{#if error}<p class="weather-error" role="alert">{$t('weather.refreshError')}</p>{/if}
			{#if data.length > 1}<StatsChart
					chartData={data}
					suffix={unit}
					title={`${$t(`weather.${metric}`)} · ${$t(intraday ? 'weather.intraday' : 'weather.dailyMean')}`}
					{intraday}
					lineColor="green"
				/>{:else}<p class="state-message">
					{$t(intraday ? 'weather.singlePoint' : 'weather.singleDailyPoint')}
				</p>{/if}
			<dl class="period-summary" aria-label={$t('weather.summary')}>
				<div>
					<dt>{$t(intraday ? 'weather.average' : 'weather.meanOfDays')}</dt>
					<dd>
						{formatReading(values.reduce((a, b) => a + b, 0) / values.length, $locale)}
						{unit}
					</dd>
				</div>
				<div>
					<dt>{$t(intraday ? 'weather.lowest' : 'weather.lowestMean')}</dt>
					<dd>{formatReading(Math.min(...values), $locale)} {unit}</dd>
				</div>
				<div>
					<dt>{$t(intraday ? 'weather.highest' : 'weather.highestMean')}</dt>
					<dd>{formatReading(Math.max(...values), $locale)} {unit}</dd>
				</div>
			</dl>
		{:else}<p class="state-message">{$t('weather.emptyRange')}</p>{/if}
	{/if}
</div>
