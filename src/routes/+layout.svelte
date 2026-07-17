<script lang="ts">
	import { Toaster } from '@/components/ui/sonner';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import Nav from '@/components/ui/nav';
	import { page } from '$app/state';
	import StateContext from '@/components/StateContext.svelte';
	import 'dayjs/locale/sk';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const year = new Date().getFullYear();
</script>

<ModeWatcher />

<Toaster />

<QueryClientProvider client={data.queryClient}>
	{#key page.url}
		<StateContext locale={data.locale} user={data.user} defaultStationId={data.defaultStationId}>
			<div class="flex min-h-screen flex-col">
				<Nav authForm={data.authForm} deleteForm={data.deleteForm} />
				<main class="flex-1">
					{@render children()}
				</main>
				{#if page.url.pathname !== '/'}
					<footer class="border-border/50 bg-background/70 border-t backdrop-blur-md">
						<div
							class="text-muted-foreground mx-auto flex max-w-7xl items-center justify-between px-4 py-3 font-mono text-xs sm:px-8"
						>
							<a
								href="/"
								class="group flex items-center gap-1 font-bold tracking-tight no-underline"
							>
								<span class="text-primary group-hover:text-primary/70 transition-colors">/</span>
								<span class="group-hover:text-primary transition-colors">meteo</span>
							</a>
							<span>&copy; {year} Meteostation</span>
						</div>
					</footer>
				{/if}
			</div>
		</StateContext>
	{/key}
</QueryClientProvider>
