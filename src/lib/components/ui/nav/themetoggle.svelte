<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import { Moon, Sun, SunMoon } from 'lucide-svelte';
	import { t } from '@/translations';
	import { cn } from '@/utils';

	const themes = $derived([
		{ id: 'light', label: $t('menu.theme.light'), Icon: Sun },
		{ id: 'dark', label: $t('menu.theme.dark'), Icon: Moon },
		{ id: 'system', label: $t('menu.theme.system'), Icon: SunMoon }
	] as const);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={buttonVariants({ variant: 'outline', size: 'icon' })}
		aria-label={$t('menu.theme.action')}
	>
		<Sun class="h-4 w-4 scale-100 transition-all duration-500 ease-out dark:scale-0" />
		<Moon class="absolute h-4 w-4 scale-0 transition-all duration-500 ease-out dark:scale-100" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-36 p-1 font-mono">
		{#each themes as { id, label, Icon }}
			{@const isActive = userPrefersMode.current === id}
			<DropdownMenu.Item
				onclick={() => (id === 'system' ? resetMode() : setMode(id))}
				class={cn(
					'relative cursor-pointer px-3 py-3 text-xs transition-colors',
					isActive
						? 'bg-primary/5 text-primary'
						: 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
				)}
			>
				{#if isActive}
					<span class="bg-primary absolute top-1/2 left-0 h-3 w-px -translate-y-1/2"></span>
				{/if}
				<Icon class="h-3.5 w-3.5 shrink-0" />
				{label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
