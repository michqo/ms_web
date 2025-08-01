<script lang="ts">
	import { page } from '$app/state';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import { ChevronDown, Cloud, Columns3, Home, Menu, Thermometer } from 'lucide-svelte';
	import { type Route } from './nav.svelte';

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
				class={isActive
					? `font-medium ${isRoot ? 'inline-block' : 'ml-2 hidden lg:inline-block'}`
					: `${isRoot ? 'inline-block' : 'ml-2 hidden lg:inline-block'}`}
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
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={[buttonVariants({ variant: 'ghost' }), 'group justify-between']}>
			<div class="flex items-center">
				{#if currentPage.icon}
					<currentPage.icon class="mr-2 h-4 w-4" />
				{/if}
				<span class="font-medium">{currentPage.name}</span>
			</div>
			<ChevronDown class="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
		</DropdownMenu.Trigger>

		<DropdownMenu.Content class="p-2">
			<!-- Header -->
			<div class="flex items-center gap-2 p-2">
				<div
					class="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-2 text-blue-700 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-300"
				>
					<Menu class="h-3.5 w-3.5" />
				</div>
				<DropdownMenu.Label class="p-0 text-sm font-semibold text-slate-900 dark:text-slate-100">
					{$t('menu.routes.label')}
				</DropdownMenu.Label>
			</div>
			<DropdownMenu.Separator />

			{#each Object.entries(isRoot ? homeRoutes : routesMap) as [route, data]}
				{@const isActive = currentPage.name === data.name}
				<a href={route} class="block w-full">
					<DropdownMenu.Item
						class="group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 {isActive
							? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-300'
							: 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
					>
						<div class="flex items-center">
							{#if data.icon}
								<data.icon
									class="mr-3 h-4 w-4 transition-colors {isActive
										? 'text-primary'
										: 'text-muted-foreground group-hover:text-foreground'}"
								/>
							{/if}
							<span class="transition-colors">{data.name}</span>
						</div>
					</DropdownMenu.Item>
				</a>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
