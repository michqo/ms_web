<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { setLocale } from '@/shared';
	import { locale, t } from '@/translations';
	import { Languages } from 'lucide-svelte';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'size-11 rounded-md' })}
		aria-label={$t('menu.language.label')}
	>
		<Languages aria-hidden="true" class="size-4" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-40 p-1">
		<DropdownMenu.RadioGroup
			value={$locale}
			onValueChange={(value) => {
				if (value === 'en' || value === 'sk') setLocale(value);
			}}
		>
			<DropdownMenu.RadioItem
				value="en"
				class="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground min-h-11 cursor-pointer text-sm"
				>{$t('menu.language.en')}</DropdownMenu.RadioItem
			>
			<DropdownMenu.RadioItem
				value="sk"
				class="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground min-h-11 cursor-pointer text-sm"
				>{$t('menu.language.sk')}</DropdownMenu.RadioItem
			>
		</DropdownMenu.RadioGroup>
	</DropdownMenu.Content>
</DropdownMenu.Root>
