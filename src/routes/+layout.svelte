<script lang="ts">
	import Loading from '@/components/Loading.svelte';
	import { Toaster } from '@/components/ui/sonner';
	import ThemeToggle from '@/components/ui/ThemeToggle.svelte';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '@/shared/api';
	import { Button } from '@/components/ui/button';
	import { page } from '$app/stores';
	import { Github } from 'lucide-svelte';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	function logOut() {
		api.setAuthToken('');
		goto('/logout');
	}
</script>

<ModeWatcher />

<Toaster />

<QueryClientProvider client={data.queryClient}>
	<Loading />
	<div
		class="sticky z-50 inset-0 flex w-full justify-center border-b border-border/40 bg-primary-foreground/60 p-4 backdrop-blur-md"
	>
		<div class="flex w-full max-w-xl items-center justify-between">
			<h1 class="text-2xl font-bold">
				{$page.url.pathname.length > 1 ? $page.url.pathname.split('/')[1] : '/'}
			</h1>
			<div class="flex items-center gap-x-2">
				{#if data.user}
					<p>{data.user}</p>
					<Button variant="outline" onclick={logOut}>Log out</Button>
				{/if}
				<ThemeToggle />
				<Button
					variant="outline"
					size="icon"
					href="https://github.com/michqo/ms_web"
					target="_blank"><Github /></Button
				>
			</div>
		</div>
	</div>
	{@render children()}
</QueryClientProvider>
