<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { t } from '@/translations';
	import { Languages, Menu } from 'lucide-svelte';
	import { item } from './i18n.svelte';
	import MenuSub from './menu-sub.svelte';
	import { option, themeIcon } from './themetoggle.svelte';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' })}>
		<Menu class="h-4 w-4" />
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
				{$t('menu.routes.action')}
			</DropdownMenu.Label>
		</div>

		<DropdownMenu.Separator />

		<MenuSub label={$t('menu.language.label')}>
			{#snippet icon()}
				<Languages class="h-4 w-4" />
			{/snippet}
			{#snippet content()}
				{@render item('en', $t('menu.language.en'), '🇬🇧')}
				{@render item('sk', $t('menu.language.sk'), '🇸🇰')}
			{/snippet}
		</MenuSub>

		<MenuSub icon={themeIcon} label={$t('menu.theme.action')}>
			{#snippet content()}
				{@render option('light', $t('menu.theme.light'), $t('menu.theme.light_description'))}
				{@render option('dark', $t('menu.theme.dark'), $t('menu.theme.dark_description'))}
				{@render option('system', $t('menu.theme.system'), $t('menu.theme.system_description'))}
			{/snippet}
		</MenuSub>
	</DropdownMenu.Content>
</DropdownMenu.Root>
