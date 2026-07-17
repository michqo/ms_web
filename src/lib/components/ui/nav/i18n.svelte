<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { setLocale } from '@/shared';
	import { locale, t } from '@/translations';
	import { Languages } from 'lucide-svelte';
	import { get } from 'svelte/store';
	import { cn } from '@/utils';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={buttonVariants({ variant: 'outline', size: 'icon' })}
		aria-label={$t('menu.language.label')}
	>
		<Languages class="h-4 w-4" />
	</DropdownMenu.Trigger>
	<form method="POST" action="?/lang">
		<DropdownMenu.Content class="w-40 p-1 font-mono">
			<DropdownMenu.Item
				onclick={() => setLocale('en')}
				class={cn(
					'relative cursor-pointer px-3 py-3 text-xs transition-colors',
					get(locale) === 'en'
						? 'bg-primary/5 text-primary'
						: 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
				)}
			>
				{#if get(locale) === 'en'}
					<span class="bg-primary absolute top-1/2 left-0 h-3 w-px -translate-y-1/2"></span>
				{/if}
				🇬🇧 {$t('menu.language.en')}
			</DropdownMenu.Item>
			<DropdownMenu.Item
				onclick={() => setLocale('sk')}
				class={cn(
					'relative cursor-pointer px-3 py-3 text-xs transition-colors',
					get(locale) === 'sk'
						? 'bg-primary/5 text-primary'
						: 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
				)}
			>
				{#if get(locale) === 'sk'}
					<span class="bg-primary absolute top-1/2 left-0 h-3 w-px -translate-y-1/2"></span>
				{/if}
				🇸🇰 {$t('menu.language.sk')}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</form>
</DropdownMenu.Root>
