<script lang="ts">
	import Loading from '@/components/Loading.svelte';
	import { Toaster } from '@/components/ui/sonner';
	import ThemeToggle from '@/components/ui/ThemeToggle.svelte';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import type { LayoutData } from './$types';
	
  export let data: LayoutData;
</script>

<ModeWatcher />

<Toaster />

<QueryClientProvider client={data.queryClient}>
	<Loading />
	<div class="fixed p-4 w-full flex justify-center">
		<div class="flex w-full max-w-xl items-center justify-between">
			<h1 class="text-2xl font-bold">Auth</h1>
			<div class="flex items-center gap-x-2">
				<ThemeToggle />
			</div>
		</div>
	</div>
	<slot />
</QueryClientProvider>
