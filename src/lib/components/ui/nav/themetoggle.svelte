<script module>
	export { themeIcon, option };
</script>

<script lang="ts">
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';
	import { SunMoon, Check, Palette } from 'lucide-svelte';
	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { buttonVariants } from '@/components/ui/button/index.js';
	import { t } from '@/translations';
</script>

{#snippet option(id: 'light' | 'dark' | 'system', label: string, description: string)}
	{@const isActive = userPrefersMode.current === id}
	<DropdownMenu.Item
		onclick={() => (id === 'system' ? resetMode() : setMode(id))}
		class={[
			'group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-200',
			{
				'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-300':
					isActive,
				'hover:bg-slate-50 dark:hover:bg-slate-800/50': !isActive
			}
		]}
	>
		<!-- Icon container -->
		<div
			class={[
				'relative rounded-lg p-2 transition-all duration-200',
				{
					'text-white shadow-lg': isActive,
					'bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700':
						!isActive
				}
			]}
		>
			{#if id == 'dark'}
				<Moon class="h-4 w-4" />
			{:else if id == 'light'}
				<Sun class="h-4 w-4" />
			{:else}
				<SunMoon class="h-4 w-4" />
			{/if}

			<!-- Active indicator -->
			{#if isActive}
				<div
					class="absolute -top-1 -right-1 rounded-full bg-white p-0.5 shadow-sm dark:bg-slate-900"
				>
					<Check class="h-2.5 w-2.5 text-green-600" />
				</div>
			{/if}
		</div>

		<!-- Content -->
		<div class="min-w-0 flex-1">
			<div class="flex items-center justify-between">
				<span
					class={[
						'text-sm transition-colors',
						{
							'text-blue-700 dark:text-blue-300': isActive,
							'text-slate-900 dark:text-slate-100': !isActive
						}
					]}
				>
					{label}
				</span>
			</div>
			<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
				{description}
			</p>
		</div>
	</DropdownMenu.Item>
{/snippet}

{#snippet themeIcon()}
	<!-- Sun icon -->
	<Sun class="h-4 w-4 scale-100 transition-all duration-500 ease-out dark:scale-0" />

	<!-- Moon icon -->
	<Moon class="absolute h-4 w-4 scale-0 transition-all duration-500 ease-out dark:scale-100" />
{/snippet}

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		{@render themeIcon()}
		<!-- Check icon for active state -->
		<span class="sr-only">{$t('menu.theme.action')}</span>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="p-2">
		<!-- Header -->
		<div class="mb-2 px-3 py-2">
			<div class="mb-1 flex items-center gap-2">
				<div
					class="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-2 text-blue-700 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-300"
				>
					<Palette class="h-3.5 w-3.5" />
				</div>
				<DropdownMenu.Label class="p-0 text-sm font-semibold text-slate-900 dark:text-slate-100">
					{$t('menu.theme.label')}
				</DropdownMenu.Label>
			</div>
		</div>

		<DropdownMenu.Separator class="my-2 bg-slate-200/50 dark:bg-slate-700/50" />

		<!-- Theme Options -->
		<div class="space-y-1">
			{@render option('light', $t('menu.theme.light'), $t('menu.theme.light_description'))}
			{@render option('dark', $t('menu.theme.dark'), $t('menu.theme.dark_description'))}
			{@render option('system', $t('menu.theme.system'), $t('menu.theme.system_description'))}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
