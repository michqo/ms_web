<script lang="ts">
	import { page } from '$app/state';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { Cloud, Home, Menu, Thermometer } from 'lucide-svelte';
	import { type Route } from './nav.svelte';
	import { t } from '@/translations';

	const routesMap: Record<string, Route> = $derived({
		'/': {
			name: $t('menu.routes.home'),
			icon: Home
		},
		'/measurements': {
			name: $t('menu.routes.measurements'),
			icon: Thermometer
		},
		'/forecast': {
			name: $t('menu.routes.forecast'),
			icon: Cloud
		}
	});

	const unknownRoute = {
		name: 'Unknown',
		icon: Home
	};

	const currentPage = $derived(routesMap[page.url.pathname] ?? unknownRoute);
</script>

<div class="hidden items-center gap-5 sm:flex">
	{#each Object.entries(routesMap) as [route, data]}
		<a
			href={route}
			class={buttonVariants({
				variant: currentPage.name === data.name ? 'default' : 'ghost',
				size: 'sm'
			})}
			title={data.name}
		>
			<data.icon class="h-4 w-4" />
			<span class={currentPage.name === data.name ? 'ml-2 hidden lg:inline-block ' : 'hidden'}>
				{data.name}
			</span>
		</a>
	{/each}
</div>

<div class="sm:hidden">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: 'secondary', size: 'sm' })}>
			<Menu class="mr-2 h-4 w-4" />
			<span>{$t('menu.routes.action')}</span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="min-w-[180px]">
			<DropdownMenu.Label>{$t('menu.routes.label')}</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				{#each Object.entries(routesMap) as [route, data]}
					<a href={route} class="block w-full">
						<DropdownMenu.Item
							class={{ 'bg-secondary font-medium': currentPage.name === data.name }}
						>
							<data.icon class="mr-2 h-4 w-4" />
							<span>{data.name}</span>
						</DropdownMenu.Item>
					</a>
				{/each}
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
