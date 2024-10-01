<script lang="ts">
	import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
	import type { LayoutData } from './$types';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from '@/components/ui/sonner';
	import Loading from '@/components/Loading.svelte';
	
  export let data: LayoutData;
</script>

<ModeWatcher />

<Toaster />

<QueryClientProvider client={data.queryClient}>
	<Loading />
	<slot />
</QueryClientProvider>
