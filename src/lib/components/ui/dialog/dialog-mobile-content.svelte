<script lang="ts">
	import { globalState } from '@/shared/runes.svelte.js';
	import { cn, type WithoutChildrenOrChild } from '@/utils.js';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';

	let {
		class: className,
		children,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		children: Snippet;
	} = $props();
</script>

<Dialog.Content
	class={cn(
		'flex flex-col sm:max-w-lg',
		{ 'h-[100vh] w-screen max-w-none rounded-none border-0': globalState.isMobile.value },
		className
	)}
	{...restProps}
>
	{@render children?.()}
</Dialog.Content>
