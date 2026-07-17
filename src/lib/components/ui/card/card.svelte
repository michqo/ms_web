<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '@/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		'bg-card text-card-foreground hover:border-primary/50 flex flex-col gap-6 rounded-xl border py-6 shadow-sm transition-colors',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
