<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Snippet } from 'svelte';

	interface Props {
		header: Snippet;
		content: Snippet;
		size?: 'sm' | 'md' | 'lg';
	}

	const { header, content, size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg'
	};
</script>

<Card.Root
	class="
		group relative w-full overflow-hidden border border-zinc-200 bg-white shadow-lg hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900/70
		{sizeClasses[size]}"
>
	<Card.Header class="relative items-center pt-8 pb-4">
		<div
			class="
			mb-6 flex items-center justify-center rounded-2xl bg-zinc-100 p-4 ring-1 ring-zinc-200 dark:bg-zinc-700 dark:ring-zinc-600
		"
		>
			{@render header()}
		</div>
	</Card.Header>

	<Card.Content class="relative space-y-4 pb-8">
		{@render content()}
	</Card.Content>
</Card.Root>
