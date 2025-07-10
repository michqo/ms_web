<script lang="ts">
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';

	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { buttonVariants } from '@/components/ui/button/index.js';
	import { SunMoon } from 'lucide-svelte';
	import { t } from '@/translations';
</script>

{#snippet active(current: string | undefined, mode: string)}
	{#if current == mode}
		<DropdownMenu.Shortcut>{$t('menu.theme.active')}</DropdownMenu.Shortcut>
	{/if}
{/snippet}

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<Sun
			class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
		/>
		<Moon
			class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
		/>
		<span class="sr-only">{$t('menu.theme.action')}</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>{$t('menu.theme.label')}</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			onclick={() => setMode('light')}
			class={{ 'bg-secondary font-medium': userPrefersMode.current === 'light' }}
		>
			<Sun class="mr-2 h-4 w-4" />
			{$t('menu.theme.light')}
			{@render active(userPrefersMode.current, 'light')}
		</DropdownMenu.Item>
		<DropdownMenu.Item
			onclick={() => setMode('dark')}
			class={{ 'bg-secondary font-medium': userPrefersMode.current === 'dark' }}
		>
			<Moon class="mr-2 h-4 w-4" />
			{$t('menu.theme.dark')}
			{@render active(userPrefersMode.current, 'dark')}
		</DropdownMenu.Item>
		<DropdownMenu.Item
			onclick={() => resetMode()}
			class={{ 'bg-secondary font-medium': userPrefersMode.current === 'system' }}
		>
			<SunMoon class="mr-2 h-4 w-4" />
			{$t('menu.theme.system')}
			{@render active(userPrefersMode.current, 'system')}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
