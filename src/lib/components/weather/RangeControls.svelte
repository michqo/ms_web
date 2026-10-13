<script lang="ts">
	import { t } from '@/translations';
	import type { Metric, RangePreset } from '@/shared/weather';
	import dayjs from 'dayjs';
	let {
		range,
		from,
		to,
		metric,
		error,
		onChange
	}: {
		range: RangePreset;
		from: string;
		to: string;
		metric: Metric;
		error: boolean;
		onChange: (values: Record<string, string | null>) => void;
	} = $props();
	let customFrom = $state('');
	let customTo = $state('');
	$effect(() => {
		customFrom = from;
		customTo = to;
	});
	const presets = [
		{ value: '1d', key: 'today' },
		{ value: '7d', key: 'sevenDays' },
		{ value: '30d', key: 'thirtyDays' },
		{ value: 'custom', key: 'custom' }
	] as const;
</script>

<div class="range-controls">
	<div class="range-presets" role="group" aria-label={$t('weather.trend')}>
		{#each presets as preset}<button
				class="weather-button"
				aria-pressed={range === preset.value}
				onclick={() =>
					onChange({
						range: preset.value,
						from: preset.value === 'custom' ? from : null,
						to: preset.value === 'custom' ? to : null,
						day: null
					})}>{$t(`weather.${preset.key}`)}</button
			>{/each}
	</div>
	<label class="metric-select"
		><span class="sr-only">{$t('weather.metric')}</span><select
			aria-label={$t('weather.metric')}
			value={metric}
			onchange={(e) => onChange({ metric: e.currentTarget.value })}
			><option value="temperature">{$t('weather.temperature')} · °C</option><option value="humidity"
				>{$t('weather.humidity')} · %</option
			></select
		></label
	>
</div>
{#if range === 'custom'}
	<form
		class="custom-range"
		onsubmit={(e) => {
			e.preventDefault();
			onChange({ from: customFrom, to: customTo, day: null });
		}}
	>
		<label
			>{$t('weather.from')}<input
				type="date"
				required
				bind:value={customFrom}
				max={dayjs.utc().format('YYYY-MM-DD')}
			/></label
		>
		<label
			>{$t('weather.to')}<input
				type="date"
				required
				bind:value={customTo}
				min={customFrom}
				max={dayjs.utc().format('YYYY-MM-DD')}
			/></label
		>
		<button class="weather-button" type="submit">{$t('weather.apply')}</button>
	</form>
{/if}
{#if error}<p role="alert" class="weather-error">{$t('weather.rangeError')}</p>{/if}
