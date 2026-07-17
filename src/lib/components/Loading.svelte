<script lang="ts">
	import { onMount } from 'svelte';
	import { useIsFetching, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { setMockMode } from '@/shared/runes.svelte';

	const isFetching = useIsFetching();
	const queryClient = useQueryClient();

	onMount(() => {
		const shownErrors = new Set<string>();
		let demoOffered = false;
		let errorCount = 0;

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

			errorCount++;
			if (errorCount >= 3 && !demoOffered) {
				demoOffered = true;
				toast('API unavailable', {
					description: 'Enable demo mode to browse with mock data',
					action: {
						label: 'Enable',
						onClick: () => setMockMode(true)
					}
				});
			}
		});

		return () => unsubscribe();
	});
</script>

{#if $isFetching > 0}
	<div class="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-0.5 overflow-hidden">
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
