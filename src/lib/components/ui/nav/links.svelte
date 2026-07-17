<script lang="ts">
	import { page } from '$app/state';
	import { buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import { CircleUser, Cloud, Columns3, Home, LogOut, Menu, Thermometer, X } from 'lucide-svelte';
	import { type Route } from './nav.svelte';
	import ThemeToggle from './themetoggle.svelte';
	import I18n from './i18n.svelte';
	import { Button } from '@/components/ui/button';
	import { enhance } from '$app/forms';
	import { get } from 'svelte/store';

	const routesMap = $derived.by(() => {
		const routes: Record<string, Route> = {};

		if (!globalState.user) {
			routes['/'] = {
				name: $t('menu.routes.home'),
				icon: Home
			};
		}

		routes['/dash'] = { name: $t('menu.routes.dash'), icon: Columns3 };
		routes['/measurements'] = { name: $t('menu.routes.measurements'), icon: Thermometer };
		routes['/forecast'] = { name: $t('menu.routes.forecast'), icon: Cloud };

		return routes;
	});

	const unknownRoute = { name: 'Unknown', icon: Home };
	const currentPage = $derived(routesMap[page.url.pathname] ?? unknownRoute);

	let mobileMenuOpen = $state(false);
</script>

<!-- Desktop Navigation -->
<div class="hidden items-center gap-1 sm:flex">
	{#each Object.entries(routesMap) as [route, data]}
		{@const isActive = currentPage.name === data.name}
		<a
			href={route}
			class={cn(
				buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'sm' }),
				'group relative transition-all duration-200'
			)}
			title={data.name}
		>
			{#if data.icon}
				<data.icon class={cn('h-3.5 w-3.5', isActive ? '' : 'text-muted-foreground')} />
			{/if}
			<span class="font-mono">
				{data.name}
			</span>
			{#if isActive}
				<div
					class="bg-primary absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full"
				></div>
			{/if}
		</a>
	{/each}
</div>

<!-- Mobile Navigation -->
<div class="sm:hidden">
	<Dialog.Root bind:open={mobileMenuOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
			<Menu class="h-4 w-4" />
		</Dialog.Trigger>
		<Dialog.Content
			class="flex h-[100vh] w-screen max-w-none flex-col items-center justify-between rounded-none border-0 p-0"
			showCloseButton={false}
		>
			<div class="border-border/50 flex w-full items-center justify-between border-b p-4">
				<a
					href="/"
					class="group flex items-center gap-1 font-mono text-sm font-bold tracking-tight no-underline"
				>
					<span class="text-primary group-hover:text-primary/70 transition-colors">/</span>
					<span class="text-foreground group-hover:text-primary transition-colors">
						{get(t)('menu.app.title')}
					</span>
				</a>
				<Button variant="ghost" size="icon" onclick={() => (mobileMenuOpen = false)}>
					<X class="h-5 w-5" />
				</Button>
			</div>

			<div class="w-full p-4">
				<h3
					class="text-muted-foreground mb-3 font-mono text-xs font-semibold tracking-widest uppercase"
				>
					{$t('menu.routes.label')}
				</h3>

				<div class="space-y-1">
					{#each Object.entries(routesMap) as [route, data]}
						{@const isActive = currentPage.name === data.name}
						<a
							href={route}
							class={cn(
								'flex items-center gap-3 rounded-md p-3 font-mono text-sm transition-colors',
								isActive
									? 'bg-primary/5 text-primary'
									: 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
							)}
							onclick={() => (mobileMenuOpen = false)}
						>
							{#if isActive}
								<span class="bg-primary h-3 w-px"></span>
							{:else}
								<span class="h-3 w-px bg-transparent"></span>
							{/if}
							{#if data.icon}
								<data.icon class="h-4 w-4" />
							{/if}
							<span>{data.name}</span>
						</a>
					{/each}
				</div>
			</div>

			<div class="border-border/50 flex w-full items-center justify-between border-t p-4">
				<div class="flex items-center gap-2">
					<ThemeToggle />
					<I18n />
				</div>
				{#if !globalState.user}
					<Button
						size="sm"
						onclick={() => {
							mobileMenuOpen = false;
							globalState.authOpen = true;
						}}
					>
						{$t('auth.login')}
					</Button>
				{:else}
					<div class="flex items-center gap-2">
						<form method="POST" action="/actions?/logout" use:enhance>
							<button
								type="submit"
								class="border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs font-medium transition-colors"
								onclick={() => (mobileMenuOpen = false)}
							>
								<LogOut class="h-3.5 w-3.5" />
								{$t('menu.actions.account.logout')}
							</button>
						</form>

						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								mobileMenuOpen = false;
								globalState.userOpen = true;
							}}
						>
							<CircleUser class="mr-2 h-4 w-4" />
							{globalState.user}
						</Button>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
