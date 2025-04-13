<script lang="ts">
	import { buttonVariants } from '@/components/ui/button/index.js';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { locale, t } from '@/translations';
	import Cookies from 'js-cookie';

  function setLocale(lang: string) {
    locale.set(lang);
    Cookies.set('lang', lang, { path: '/' });
  }
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		{$locale}
	</DropdownMenu.Trigger>
	<form method="POST" action="?/lang">
		<DropdownMenu.Content>
			<DropdownMenu.Label>{$t('menu.language.label')}</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={() => setLocale('en')}
				class={{ 'bg-secondary font-medium': $locale == 'en' }}
			>
				{$t('menu.language.en')}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				onclick={() => setLocale('sk')}
				class={{ 'bg-secondary font-medium': $locale == 'sk' }}
			>
				{$t('menu.language.sk')}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</form>
</DropdownMenu.Root>
