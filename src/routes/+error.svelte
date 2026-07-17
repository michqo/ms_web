<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '@/components/ui/button';
	import { onMount } from 'svelte';

	let statusText = $state('');
	let messageText = $state('');

	$effect(() => {
		const status = page.status;
		switch (status) {
			case 404:
				statusText = `${status}`;
				messageText = 'Page not found';
				break;
			default:
				statusText = status ? `${status}` : '';
				messageText = 'Something went wrong';
				break;
		}
	});
</script>

<svelte:head>
	<title>{statusText} — Meteostation</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4">
	<div class="flex flex-col items-center text-center font-mono">
		<div class="mb-2 flex items-center gap-1 text-5xl font-bold tracking-tight">
			<span class="text-primary">{statusText}</span>
		</div>
		<p class="text-muted-foreground mb-8 text-sm">{messageText}</p>
		<Button variant="outline" href="/" class="gap-2">Go Home</Button>
	</div>
</div>
