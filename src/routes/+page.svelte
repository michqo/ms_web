<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { api } from '@/shared/api';
	import { createQuery } from '@tanstack/svelte-query';

	const dataQuery = createQuery({
		queryKey: ['measurements'],
		queryFn: () => api.getMeasurements()
	});
</script>

<main class="grid h-screen items-center justify-center">
	<div class="grid w-[400px]">
		<div class="grid grid-cols-2 gap-2">
			{#if $dataQuery.data}
				{#each $dataQuery.data as measurement}
					<div class="grid gap-1">
						<p>{measurement.temperature}</p>
						<p>{measurement.humidity} %</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</main>
