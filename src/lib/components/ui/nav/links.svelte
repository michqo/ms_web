<script lang="ts">
	import { page } from '$app/state';
	import { t } from '@/translations';
	import { getGlobalState } from '@/shared/runes.svelte';
	const state = getGlobalState();
	const base = $derived(state.demo ? '/demo' : '/dash');
	const history = $derived(state.demo ? '/demo/measurements' : '/measurements');
</script>

<nav class="weather-nav" aria-label={$t('weather.navigation')}>
	<a
		href={`${base}${page.url.search ? `?${page.url.searchParams}` : ''}`}
		aria-current={page.url.pathname === base ? 'page' : undefined}>{$t('weather.overview')}</a
	>
	<a
		href={`${history}${page.url.search ? `?${page.url.searchParams}` : ''}`}
		aria-current={page.url.pathname === history ? 'page' : undefined}>{$t('weather.history')}</a
	>
</nav>
