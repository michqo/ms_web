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
	import 'dayjs/locale/sk';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();
</script>

<ModeWatcher />

<Toaster />

<QueryClientProvider client={data.queryClient}>
	{#key page.url}
		<StateContext locale={data.locale} user={data.user}>
			<Nav authForm={data.authForm} deleteForm={data.deleteForm} />
			<Loading />
			<div class="h-full w-full" in:fade>
				{@render children()}
			</div>
		</StateContext>
	{/key}
</QueryClientProvider>
