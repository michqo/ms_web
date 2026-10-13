<script lang="ts">
	import { t, locale } from '@/translations';
	import type { Forecast } from '@/shared/types';
	import { transformForecast } from '@/shared';
	import { formatReading } from '@/shared/weather';
	import * as Dialog from '@/components/ui/dialog';
	import ForecastDetail from '@/components/forecast/dialog-card.svelte';
	import dayjs from 'dayjs';
	let {
		data,
		pending,
		error,
		onRetry
	}: {
		data?: Forecast;
		pending: boolean;
		error: boolean;
		onRetry: () => void;
	} = $props();
	const days = $derived(data ? transformForecast(data) : []);
	let selected = $state<number | null>(null);
	let open = $state(false);
	$effect(() => {
		data;
		selected = null;
		open = false;
	});
</script>

<section class="forecast-section" aria-labelledby="forecast-title" aria-busy={pending}>
	<div class="section-heading">
		<h2 id="forecast-title">{$t('weather.forecast')}</h2>
		<span class="eyebrow">meteoblue</span>
	</div>
	{#if pending && !data}<p class="state-message">{$t('weather.loading')}</p>
	{:else if error && !data}<div class="state-message" role="alert">
			<p>{$t('weather.forecastError')}</p>
			<button class="weather-button" onclick={onRetry}>{$t('weather.retry')}</button>
		</div>
	{:else if days.length}
		{#if error}<p class="weather-error" role="alert">{$t('weather.refreshError')}</p>{/if}
		<div class="forecast-labels" aria-hidden="true">
			<span></span><span>°C</span><span>mm</span><span>m/s</span>
		</div>
		<ol class="forecast-list">
			{#each days as day, index}<li>
					<button
						class="forecast-row"
						onclick={() => {
							selected = index;
							open = true;
						}}
						aria-label={`${day.time.locale($locale).format('dddd D MMMM')}, ${$t('weather.forecastDetails')}`}
					>
						<span class="forecast-day"
							><day.icon width={32} height={32} /><span
								>{index === 0 && day.time.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
									? $t('weather.today')
									: day.time.locale($locale).format('ddd')}<small
									>{day.time.locale($locale).format('D MMM')}</small
								></span
							></span
						>
						<span class="forecast-temperature"
							><span class="sr-only">{$t('weather.temperature')} </span>{formatReading(
								day.temperature_max,
								$locale,
								0
							)}<small> / {formatReading(day.temperature_min, $locale, 0)}</small><span
								class="sr-only"
							>
								°C</span
							></span
						>
						<span
							><span class="sr-only">{$t('weather.rain')} </span>{formatReading(
								day.precipitation,
								$locale
							)}<span class="sr-only"> mm</span></span
						>
						<span
							><span class="sr-only">{$t('weather.wind')} </span>{formatReading(
								day.windspeed_mean,
								$locale,
								0
							)}<span class="sr-only"> m/s</span></span
						>
					</button>
				</li>{/each}
		</ol>
		<div class="forecast-metadata">
			<p>
				{$t('weather.modelRun')}: {dayjs(data!.modelrun_utc)
					.utc()
					.locale($locale)
					.format('D MMM · HH:mm')} UTC
			</p>
			<p>
				{$t('weather.retrieved')}: {dayjs(data!.created_at)
					.utc()
					.locale($locale)
					.format('D MMM · HH:mm')} UTC
			</p>
			<p>{$t('weather.forecastSource')}</p>
		</div>
	{:else}<p class="state-message">{$t('weather.noForecast')}</p>{/if}
</section>
<Dialog.Root bind:open
	><Dialog.Content class="sm:max-w-lg"
		><Dialog.Header
			><Dialog.Title>{$t('weather.forecastDetails')}</Dialog.Title><Dialog.Description
				>{selected !== null && days[selected]
					? days[selected].time.locale($locale).format('dddd D MMMM')
					: ''}</Dialog.Description
			></Dialog.Header
		>
		{#if selected !== null && days[selected]}<ForecastDetail
				forecast={days[selected]}
				allForecasts={days}
				currentIndex={selected}
				onNavigate={(index) => (selected = index)}
			/>{/if}
	</Dialog.Content></Dialog.Root
>
