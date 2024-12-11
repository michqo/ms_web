<script lang="ts">
	import { navigating } from '$app/stores';
	import { useIsFetching } from '@tanstack/svelte-query';
	import { LoaderCircle } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	const isFetching = useIsFetching();
</script>

{#if $navigating || $isFetching}
	<div
		class="fixed inset-0 top-4 flex w-full items-center justify-center text-lg text-muted-foreground"
		transition:fade={{ duration: 300 }}
	>
		<LoaderCircle class="mr-2 h-6 w-6 animate-spin" />
		Loading...
	</div>
{/if}
