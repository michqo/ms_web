<script lang="ts">
	import Loading from '@/components/Loading.svelte';
	import { Toaster } from '@/components/ui/sonner';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import Nav from '@/components/ui/nav';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import StateContext from '@/components/StateContext.svelte';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();
</script>

<ModeWatcher />

<Toaster />

<QueryClientProvider client={data.queryClient}>
	<StateContext isUser={data.user != undefined}>
		<Nav user={data?.user} data={data.form} />
		{#key page.url}
			<Loading />
			<div class="h-full w-full" in:fade>
				{@render children()}
			</div>
		{/key}
	</StateContext>
</QueryClientProvider>
