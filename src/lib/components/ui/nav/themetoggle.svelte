<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { mode, resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import { Moon, Sun, SunMoon } from '@lucide/svelte';
	import { t } from '@/translations';

	const themes = $derived([
		{ id: 'light', label: $t('menu.theme.light'), Icon: Sun },
		{ id: 'dark', label: $t('menu.theme.dark'), Icon: Moon },
		{ id: 'system', label: $t('menu.theme.system'), Icon: SunMoon }
	] as const);
	const TriggerIcon = $derived(
		mode.current === 'dark' ? Moon : mode.current === 'light' ? Sun : SunMoon
	);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'size-11 rounded-md' })}
		aria-label={$t('menu.theme.action')}
	>
		<TriggerIcon aria-hidden="true" class="size-4" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-40 p-1">
		<DropdownMenu.RadioGroup
			value={userPrefersMode.current ?? 'system'}
			onValueChange={(value) => {
				if (value === 'system') resetMode();
				else if (value === 'light' || value === 'dark') setMode(value);
			}}
		>
			{#each themes as { id, label, Icon }}
				<DropdownMenu.RadioItem
					value={id}
					class="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground min-h-11 cursor-pointer text-sm"
				>
					<Icon aria-hidden="true" class="size-4" />
					{label}
				</DropdownMenu.RadioItem>
			{/each}
		</DropdownMenu.RadioGroup>
	</DropdownMenu.Content>
</DropdownMenu.Root>
