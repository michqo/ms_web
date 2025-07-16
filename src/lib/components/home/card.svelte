<script lang="ts">
	import * as Card from '@/components/ui/card';
	import type { Snippet } from 'svelte';

	interface Props {
		header: Snippet;
		content: Snippet;
	}

	const { header, content }: Props = $props();
</script>

<Card.Root class="drop-shadow-md drop-shadow-cyan-50/70 dark:drop-shadow-cyan-950/60">
	<Card.Header class="items-center pb-2">
		<div class="bg-primary-foreground mb-4 flex items-center gap-2 rounded-full p-3">
			{@render header()}
		</div>
	</Card.Header>
	<Card.Content>
		{@render content()}
	</Card.Content>
</Card.Root>
