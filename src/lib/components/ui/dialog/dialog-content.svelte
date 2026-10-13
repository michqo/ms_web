<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { t } from '@/translations';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';
	import { cn, type WithoutChildrenOrChild } from '@/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		onOpenAutoFocus: openAutoFocus,
		onCloseAutoFocus: closeAutoFocus,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: DialogPrimitive.PortalProps;
		children: Snippet;
		showCloseButton?: boolean;
	} = $props();

	let previousFocus: HTMLElement | null = null;
	function onOpen(event: Event) {
		previousFocus = document.activeElement as HTMLElement;
		openAutoFocus?.(event);
	}
	function onClose(event: Event) {
		closeAutoFocus?.(event);
		if (!event.defaultPrevented && previousFocus?.isConnected) {
			event.preventDefault();
			previousFocus.focus();
		}
	}
</script>

<Dialog.Portal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		onOpenAutoFocus={onOpen}
		onCloseAutoFocus={onClose}
		class={cn(
			'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid max-h-[90dvh] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-lg border p-6 shadow-lg shadow-black/10 duration-200 sm:max-w-lg dark:shadow-black/30 [&_[data-slot=dialog-header]]:pr-8',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close
				class="ring-offset-background focus:ring-ring absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
			>
				<XIcon />
				<span class="sr-only">{$t('weather.close')}</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</Dialog.Portal>
