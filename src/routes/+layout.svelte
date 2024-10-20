<script lang="ts">
	import Loading from '@/components/Loading.svelte';
	import { Toaster } from '@/components/ui/sonner';
	import ThemeToggle from '@/components/ui/ThemeToggle.svelte';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { api } from '@/shared/api';
	import {Button} from '@/components/ui/button';
	
  export let data: LayoutData;

	function logOut() {
		api.setAuthToken('');
		goto('/logout');
	}
</script>

<ModeWatcher />

<Toaster />

<QueryClientProvider client={data.queryClient}>
	<Loading />
	<div class="fixed p-4 w-full flex justify-center">
		<div class="flex w-full max-w-xl items-center justify-between">
			<h1 class="text-2xl font-bold">Auth</h1>
			<div class="flex items-center gap-x-2">
				<p>{data.user ? data.user : ''}</p>
				<Button variant='outline' on:click={logOut}>Log out</Button>
				<ThemeToggle />
			</div>
		</div>
	</div>
	<slot />
</QueryClientProvider>
