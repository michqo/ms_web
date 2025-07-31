<script lang="ts">
	import { page } from '$app/state';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import { ChevronDown, Cloud, Columns3, Home, Thermometer } from 'lucide-svelte';
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

	const isHome = $derived(page.url.pathname === '/');
	const currentPage = $derived(
		isHome
			? page.url.hash == ''
				? homeRoutes['#hero']
				: (homeRoutes[page.url.hash] ?? unknownRoute)
			: (routesMap[page.url.pathname] ?? unknownRoute)
	);
</script>

<!-- Desktop Navigation -->
<div class="hidden items-center gap-2 sm:flex">
	{#each Object.entries(isHome ? homeRoutes : routesMap) as [route, data]}
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
					? `font-medium ${isHome ? 'inline-block' : 'ml-2 hidden lg:inline-block'}`
					: `${isHome ? 'inline-block' : 'ml-2 hidden lg:inline-block'}`}
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
<div class="sm:hidden">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class={cn(
				buttonVariants({ variant: 'outline', size: 'sm' }),
				'group hover:bg-accent w-full justify-between transition-all duration-200'
			)}
		>
			<div class="flex items-center">
				{#if currentPage.icon}
					<currentPage.icon class="mr-2 h-4 w-4" />
				{/if}
				<span class="font-medium">{currentPage.name}</span>
			</div>
			<ChevronDown class="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
		</DropdownMenu.Trigger>

		<DropdownMenu.Content class="animate-in slide-in-from-top-2 min-w-[200px]">
			<DropdownMenu.Label
				class="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
			>
				{$t('menu.routes.label')}
			</DropdownMenu.Label>
			<DropdownMenu.Separator />

			<DropdownMenu.Group>
				{#each Object.entries(isHome ? homeRoutes : routesMap) as [route, data]}
					{@const isActive = currentPage.name === data.name}
					<a href={route} class="block w-full">
						<DropdownMenu.Item
							class="group relative transition-colors duration-150 {isActive
								? 'bg-primary/10 text-primary font-medium'
								: 'hover:bg-accent/50'}"
						>
							<div class="flex w-full items-center justify-between">
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
							</div>
						</DropdownMenu.Item>
					</a>
				{/each}
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
