<script lang="ts">
	import * as Card from '@/components/ui/card';
	import { cn } from '@/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		header: Snippet;
		content: Snippet;
		size?: 'sm' | 'md' | 'lg';
	}

	const { class: className = '', header, content, size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg'
	};
</script>

<Card.Root
	class={cn(
		'group border-border/50 bg-card hover:border-primary/40 relative w-full overflow-hidden rounded-xl border shadow-xs transition-all hover:shadow-sm',
		sizeClasses[size],
		className
	)}
>
	<Card.Header class="relative items-center pt-8 pb-4">
		<div class="bg-muted ring-border mb-6 flex items-center justify-center rounded-2xl p-4 ring-1">
			{@render header()}
		</div>
	</Card.Header>

	<Card.Content class="relative space-y-4 pb-8">
		{@render content()}
	</Card.Content>
</Card.Root>
