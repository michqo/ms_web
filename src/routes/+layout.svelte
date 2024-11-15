<script lang="ts">
	import Loading from '@/components/Loading.svelte';
	import { Toaster } from '@/components/ui/sonner';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import Nav from '@/components/Nav.svelte';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();
</script>

<ModeWatcher />

<Toaster />

<QueryClientProvider client={data.queryClient}>
	<Loading />
	<Nav user={data?.user} />
	{@render children()}
</QueryClientProvider>
