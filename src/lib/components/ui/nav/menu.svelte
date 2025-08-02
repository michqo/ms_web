<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { t } from '@/translations';
	import { Ellipsis, Languages, Menu } from 'lucide-svelte';
	import { item } from './i18n.svelte';
	import { option, themeIcon } from './themetoggle.svelte';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
		<Ellipsis class="h-4 w-4" />
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="flex items-center gap-2">
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>
				<Languages class="h-4 w-4" />
			</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent side="bottom">
				{@render item('en', $t('menu.language.en'), '🇬🇧')}
				{@render item('sk', $t('menu.language.sk'), '🇸🇰')}
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>

		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>
				{@render themeIcon()}
			</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent side="bottom">
				{@render option('light', $t('menu.theme.light'), $t('menu.theme.light_description'))}
				{@render option('dark', $t('menu.theme.dark'), $t('menu.theme.dark_description'))}
				{@render option('system', $t('menu.theme.system'), $t('menu.theme.system_description'))}
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
	</DropdownMenu.Content>
</DropdownMenu.Root>
