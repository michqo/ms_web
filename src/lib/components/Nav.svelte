<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '@/components/ui/button';
	import ThemeToggle from '@/components/ui/ThemeToggle.svelte';
	import { api } from '@/shared/api';
	import { Github } from 'lucide-svelte';

	let { user }: { user?: string } = $props();

	function logOut() {
		api.setAuthToken('');
		goto('/logout');
	}
</script>

<div
	class="sticky inset-0 z-50 flex w-full justify-center border-b border-border/40 bg-primary-foreground/60 p-4 backdrop-blur-md"
>
	<div class="flex w-full max-w-xl items-center justify-between">
		<h1 class="text-2xl font-bold">
			{$page.url.pathname.length > 1 ? $page.url.pathname.split('/')[1] : '/'}
		</h1>
		<div class="flex items-center gap-x-2">
			{#if user}
				<p>{user}</p>
				<Button variant="outline" onclick={logOut}>Log out</Button>
			{/if}
			<ThemeToggle />
			<Button variant="outline" size="icon" href="https://github.com/michqo/ms_web" target="_blank"
				><Github /></Button
			>
		</div>
	</div>
</div>
