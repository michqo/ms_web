<script lang="ts">
	import { page } from '$app/state';
	import { t } from '@/translations';
</script>

<svelte:head><title>{page.status} · Weather Station · Miqal</title></svelte:head>
<div class="weather-workspace empty-workspace">
	<p class="eyebrow">{page.status}</p>
	<h1>{$t(page.status === 404 ? 'weather.notFound' : 'weather.pageError')}</h1>
	<a href="/dash" class="weather-button">{$t('weather.back')}</a>
</div>
