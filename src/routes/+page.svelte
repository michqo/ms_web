<script lang="ts">
	import { t } from '@/translations';
	import { ArrowUpRight, Droplets } from '@lucide/svelte';
</script>

<svelte:head
	><title>Weather Station · Miqal</title><meta
		name="description"
		content={$t('weather.pageDescription')}
	/><meta property="og:title" content="Weather Station · Miqal" /><meta
		property="og:description"
		content={$t('weather.pageDescription')}
	/><meta property="og:type" content="website" /><meta
		property="og:image"
		content="https://ms.miqal.xyz/weather-preview.png"
	/><meta name="twitter:card" content="summary_large_image" /></svelte:head
>
<div class="weather-landing">
	<section class="landing-copy">
		<p class="eyebrow">Weather Station</p>
		<h1>{$t('weather.homeTitle')}</h1>
		<p class="landing-description">{$t('weather.homeCopy')}</p>
		<div class="landing-actions">
			<a href="/dash" class="weather-button primary"
				>{$t('weather.openApp')}<ArrowUpRight size={18} aria-hidden="true" /></a
			><a href="/demo" class="weather-button">{$t('weather.tryDemo')}</a>
		</div>
		<p class="landing-footer">{$t('weather.homeFooter')}</p>
	</section>
	<section class="landing-preview" aria-label={$t('weather.homePreview')}>
		<div class="preview-header">
			<span class="font-mono">/miqal / meteo</span><span class="sample-badge"
				>{$t('weather.sample')}</span
			>
		</div>
		<h2>Bratislava</h2>
		<p class="muted">{$t('weather.observed')}</p>
		<div class="preview-reading">
			24.1<span>°C</span>
			<div>
				<Droplets size={18} aria-hidden="true" /><strong>65%</strong><small
					>{$t('weather.humidity')}</small
				>
			</div>
		</div>
		<div class="preview-trend">
			<span>{$t('weather.dailyMean')} · °C</span><svg
				viewBox="0 0 440 130"
				role="img"
				aria-label={$t('weather.sample')}
				><path d="M0 110H440 M0 60H440 M0 10H440" class="preview-grid" /><path
					d="M8 88L78 64L148 77L218 35L288 48L358 24L432 40"
					class="preview-line"
				/></svg
			>
			<div><span>05.10</span><span>11.10</span></div>
		</div>
		<a class="text-link" href="/demo"
			>{$t('weather.tryDemo')}<ArrowUpRight size={16} aria-hidden="true" /></a
		>
	</section>
</div>
