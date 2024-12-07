<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button, buttonVariants } from '@/components/ui/button';
	import ThemeToggle from '@/components/ui/ThemeToggle.svelte';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { api } from '@/shared/api';
	import { Github } from 'lucide-svelte';
	import { User } from 'lucide-svelte';

	let { user }: { user?: string } = $props();

	let pathname = $derived($page.url.pathname.length > 1 ? $page.url.pathname.split('/')[1] : '/');

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
			{pathname}
		</h1>
		<div class="flex items-center gap-x-2">
			<ThemeToggle />
			<Button variant="ghost" size="icon" href="https://github.com/michqo/ms_web" target="_blank"
				><Github /></Button
			>
			{#if user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
						<User />
						{user}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item>Profile</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Group>
							<DropdownMenu.Item onclick={logOut}>Log out</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
	</div>
</div>
