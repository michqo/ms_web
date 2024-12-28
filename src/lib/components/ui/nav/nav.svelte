<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '@/components/ui/button';
	import { Github } from 'lucide-svelte';
	import ThemeToggle from './themetoggle.svelte';
	import Actions from './actions.svelte';

	let { user }: { user?: string } = $props();

	let pathname = $derived($page.url.pathname.length > 1 ? $page.url.pathname.split('/')[1] : '/');
</script>

<div
	class="sticky inset-0 z-50 flex w-full justify-center border-b border-border/40 bg-primary-foreground/60 p-4 backdrop-blur-md"
>
	<div class="flex w-full max-w-xl items-center justify-between">
		<h1 class="text-2xl font-bold">
			{pathname}
		</h1>
		<div class="flex items-center gap-x-2">
			<ThemeToggle />
			<Button variant="ghost" size="icon" href="https://github.com/michqo/ms_web" target="_blank"
				><Github /></Button
			>
			<Actions {user} />
		</div>
	</div>
</div>
