<script lang="ts">
	import { page } from '$app/state';
	import { buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import {
		ChevronDown,
		CircleUser,
		Cloud,
		Columns3,
		Home,
		LogOut,
		Menu,
		Thermometer,
		X
	} from 'lucide-svelte';
	import { logo, type Route } from './nav.svelte';
	import ThemeToggle from './themetoggle.svelte';
	import I18n from './i18n.svelte';
	import { Button } from '@/components/ui/button';
	import { enhance } from '$app/forms';

	const routesMap = $derived.by(() => {
		const routes: Record<string, Route> = {};

		if (!globalState.user) {
			routes['/'] = {
				name: $t('menu.routes.home'),
				icon: Home
			};
		}

		routes['/dash'] = {
			name: $t('menu.routes.dash'),
			icon: Columns3
		};
		routes['/measurements'] = {
			name: $t('menu.routes.measurements'),
			icon: Thermometer
		};
		routes['/forecast'] = {
			name: $t('menu.routes.forecast'),
			icon: Cloud
		};

		return routes;
	});

	const unknownRoute = {
		name: 'Unknown',
		icon: Home
	};

	const homeRoutes: Record<string, Route> = {
		'#hero': {
			name: $t('menu.routes.home'),
			icon: null
		},
		'#features': {
			name: $t('menu.routes.features'),
			icon: null
		},
		'#footer': {
			name: $t('menu.routes.footer'),
			icon: null
		}
	};

	const isRoot = $derived(page.url.pathname === '/');
	const currentPage = $derived(
		isRoot
			? page.url.hash == ''
				? homeRoutes['#hero']
				: (homeRoutes[page.url.hash] ?? unknownRoute)
			: (routesMap[page.url.pathname] ?? unknownRoute)
	);

	let mobileMenuOpen = $state(false);
</script>

<!-- Desktop Navigation -->
<div class="hidden items-center gap-2 sm:flex">
	{#each Object.entries(isRoot ? homeRoutes : routesMap) as [route, data]}
		{@const isActive = currentPage.name === data.name}
		<a
			href={route}
			class={cn(
				buttonVariants({
					variant: isActive ? 'default' : 'ghost',
					size: 'sm'
				}),
				'group relative transition-all duration-200 hover:scale-105'
			)}
			title={data.name}
		>
			{#if data.icon}
				<data.icon class="h-4 w-4 transition-transform group-hover:scale-110" />
			{/if}
			<span
				class={{
					'font-medium': isActive,
					'ml-2 hidden lg:inline-block': !isRoot,
					'inline-block': isRoot
				}}
			>
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
<div class={['sm:hidden', { hidden: isRoot }]}>
	<Dialog.Root bind:open={mobileMenuOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
			<Menu />
		</Dialog.Trigger>
		<Dialog.Content
			class="flex h-[100vh] w-screen max-w-none flex-col items-center justify-between rounded-none border-0 p-0"
			showCloseButton={false}
		>
			<!-- Header with close button -->
			<div class="flex w-full items-center justify-between border-b p-4">
				{@render logo()}
				<Button variant="ghost" size="icon" onclick={() => (mobileMenuOpen = false)}>
					<X class="h-5 w-5" />
				</Button>
			</div>

			<!-- Navigation Items -->
			<div class="w-full p-4">
				<h3 class="text-primary mb-3 font-semibold">{$t('menu.routes.label')}</h3>

				<div class="space-y-1">
					{#each Object.entries(routesMap) as [route, data]}
						{@const isActive = currentPage.name === data.name}
						<a
							href={route}
							class={[
								'flex items-center gap-3 rounded-md p-3',
								{
									'bg-gradient-to-r from-blue-50/70 to-cyan-50/70 dark:from-blue-950/70 dark:to-cyan-950/70':
										isActive,
									'hover:bg-muted/80': !isActive
								}
							]}
							onclick={() => (mobileMenuOpen = false)}
						>
							<div
								class={[
									'flex h-9 w-9 items-center justify-center rounded-md',
									{
										'bg-primary/20 text-primary': isActive,
										'bg-muted text-muted-foreground': !isActive
									}
								]}
							>
								<data.icon class="h-5 w-5" />
							</div>
							<span class={['text-base', { 'font-medium': isActive }]}>{data.name}</span>
						</a>
					{/each}
				</div>
			</div>

			<!-- Footer with user actions and theme toggle -->
			<div
				class="bg-background/80 flex w-full items-center justify-between border-t p-4 backdrop-blur"
			>
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
								class="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/30"
								onclick={() => (mobileMenuOpen = false)}
							>
								<LogOut class="h-4 w-4" />
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
