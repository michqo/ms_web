<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { t } from '@/translations';

	let { data }: { data: { reason: string } } = $props();
</script>

<svelte:head>
	<title>{$t('auth.oauth_error_title')}</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
	<div class="border-border/50 bg-card max-w-md rounded-xl border p-8 text-center shadow-xs">
		<h1 class="mb-2 text-lg font-semibold">{$t('auth.oauth_error_title')}</h1>
		{#if data.reason === 'invalid_ticket'}
			<p class="text-muted-foreground text-sm">{$t('auth.oauth_error_invalid')}</p>
		{:else}
			<p class="text-muted-foreground text-sm">{$t('auth.oauth_error_unavailable')}</p>
		{/if}
		<Button class="mt-5 w-full" variant="outline" href="/">{$t('auth.oauth_error_retry')}</Button>
	</div>
</div>
