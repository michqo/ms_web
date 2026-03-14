<script lang="ts">
	import { onMount } from 'svelte';
	import { useIsFetching, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';

	const isFetching = useIsFetching();
	const queryClient = useQueryClient();

	onMount(() => {
		const shownErrors = new Set<string>();
		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			if (event?.type !== 'updated') return;

			const query = event.query;
			if (query.state.status !== 'error' || !query.state.error) return;

			const key = `${query.queryHash}-${query.state.errorUpdatedAt}`;
			if (shownErrors.has(key)) return;
			shownErrors.add(key);

			const message =
				query.state.error instanceof Error
					? query.state.error.message
					: 'An unexpected error occurred while loading data.';

			toast.error(message || 'An unexpected error occurred while loading data.');
		});

		return () => unsubscribe();
	});
</script>

{#if $isFetching > 0}
	<div
		class="pointer-events-none absolute inset-x-3 bottom-1 z-50 h-1 overflow-hidden rounded-full sm:inset-x-0 sm:bottom-0 sm:h-0.5 sm:rounded-none"
	>
		<div class="bg-primary/15 absolute inset-0"></div>
		<div class="bg-primary loading-bar h-full w-1/3"></div>
	</div>
{/if}

<style>
	.loading-bar {
		will-change: transform;
		animation: nav-loading-slide 1.4s ease-in-out infinite;
	}

	@keyframes nav-loading-slide {
		0% {
			transform: translateX(-120%);
		}
		100% {
			transform: translateX(420%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-bar {
			animation-duration: 2.2s;
		}
	}
</style>
