<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { t } from '@/translations';

	let { data }: { data: { reason: string } } = $props();
</script>

<svelte:head>
	<title>{$t('auth.oauth_error_title')} · Weather Station · Miqal</title>
</svelte:head>

<div class="weather-workspace flex min-h-[60dvh] flex-col items-start justify-center gap-4">
	<div class="max-w-md">
		<h1 class="mb-3 text-3xl font-semibold">{$t('auth.oauth_error_title')}</h1>
		{#if data.reason === 'invalid_ticket'}
			<p class="text-muted-foreground text-sm">{$t('auth.oauth_error_invalid')}</p>
		{:else}
			<p class="text-muted-foreground text-sm">{$t('auth.oauth_error_unavailable')}</p>
		{/if}
		<Button class="mt-5 min-h-11" variant="outline" href="/">{$t('auth.oauth_error_retry')}</Button>
	</div>
</div>
