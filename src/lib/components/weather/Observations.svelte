<script lang="ts">
	import { t, locale } from '@/translations';
	import type { Measurement } from '@/shared/types';
	import { formatReading, measurementAge, windDirection } from '@/shared/weather';
	import { onMount } from 'svelte';
	let {
		reading,
		pending,
		error,
		demo,
		onRetry
	}: {
		reading?: Measurement | null;
		pending: boolean;
		error: boolean;
		demo: boolean;
		onRetry: () => void;
	} = $props();
	let now = $state(Date.now());
	onMount(() => {
		const timer = setInterval(() => (now = Date.now()), 30_000);
		return () => clearInterval(timer);
	});
	const age = $derived(reading ? measurementAge(reading.timestamp, now) : 0);
</script>

<section class="observations" aria-labelledby="observations-title" aria-busy={pending}>
	<div class="section-heading">
		<h2 id="observations-title" class="eyebrow">{$t('weather.observed')}</h2>
		{#if reading}<p class="reading-age">
				{demo
					? $t('weather.sample')
					: `${$t('weather.updated')} ${age} ${$t('weather.minutesAgo')}`}<time
					datetime={reading.timestamp.toISOString()}
					>{reading.timestamp.utc().locale($locale).format('D MMM · HH:mm')} UTC</time
				>
			</p>{/if}
	</div>
	{#if pending && !reading}<p class="state-message">{$t('weather.loading')}</p>
	{:else if error && !reading}<div class="state-message" role="alert">
			<p>{$t('weather.latestError')}</p>
			<button class="weather-button" onclick={onRetry}>{$t('weather.retry')}</button>
		</div>
	{:else if reading}
		<div class="current-readings">
			<div class="temperature-reading">
				<span class="sr-only">{$t('weather.temperature')}</span>{formatReading(
					reading.temperature,
					$locale
				)}<span class="reading-unit">°C</span>
			</div>
			<dl class="sensor-readings">
				<div>
					<dt>{$t('weather.humidity')}</dt>
					<dd>{formatReading(reading.humidity, $locale, 0)}<span>%</span></dd>
				</div>
				{#if reading.pressure !== null}<div>
						<dt>{$t('weather.pressure')}</dt>
						<dd>{formatReading(reading.pressure, $locale, 0)}<span>hPa</span></dd>
					</div>{/if}
				{#if reading.wind_speed !== null}<div>
						<dt>{$t('weather.wind')}</dt>
						<dd>
							{formatReading(reading.wind_speed, $locale)}<span
								>m/s · {windDirection(reading.wind_direction)}</span
							>
						</dd>
					</div>{/if}
				{#if reading.rain !== null}<div>
						<dt>{$t('weather.rain')}</dt>
						<dd>{formatReading(reading.rain, $locale)}<span>mm</span></dd>
					</div>{/if}
			</dl>
		</div>
		{#if error}<p class="weather-error" role="alert">
				{$t('weather.refreshError')}
			</p>{:else if !demo && age > 60}<p class="muted">{$t('weather.stale')}</p>{/if}
	{:else}<p class="state-message">{$t('weather.noReadings')}</p>{/if}
</section>
