<script module>
	export { item };
</script>

<script lang="ts">
	import { buttonVariants } from '@/components/ui/button/index.js';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { setLocale } from '@/shared';
	import { locale, t } from '@/translations';
	import { Check, Languages } from 'lucide-svelte';
	import { get } from 'svelte/store';
</script>

{#snippet item(code: string, name: string, flag: string)}
	<!-- Fun fact: Works only with get(), $locale gives error -->
	{@const isActive = get(locale) === code}
	<DropdownMenu.Item
		onclick={() => setLocale(code)}
		class="group p-3 {isActive
			? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-300'
			: 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
	>
		<!-- Icon container -->
		<div
			class="relative flex h-10 w-10 items-center justify-center rounded-lg p-2 transition-all duration-200 {isActive
				? `text-white shadow-lg`
				: 'bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700'}"
		>
			{flag}
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
		<span
			class="text-sm font-medium transition-colors {isActive
				? 'text-blue-700 dark:text-blue-300'
				: 'text-slate-900 dark:text-slate-100'}"
		>
			{name}
		</span>
	</DropdownMenu.Item>
{/snippet}

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<Languages class="h-4 w-4" />
	</DropdownMenu.Trigger>
	<form method="POST" action="?/lang">
		<DropdownMenu.Content class="p-2">
			<!-- Header -->
			<div class="mb-2 px-3 py-2">
				<div class="mb-1 flex items-center gap-2">
					<div
						class="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-2 text-blue-700 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-300"
					>
						<Languages class="h-3.5 w-3.5" />
					</div>
					<DropdownMenu.Label class="p-0 text-sm font-semibold text-slate-900 dark:text-slate-100">
						{$t('menu.language.label')}
					</DropdownMenu.Label>
				</div>
				<p class="pl-8 text-xs text-slate-500 dark:text-slate-400">
					{$t('menu.language.hint')}
				</p>
			</div>
			<DropdownMenu.Separator />
			<div class="space-y-1">
				{@render item('en', $t('menu.language.en'), '🇬🇧')}
				{@render item('sk', $t('menu.language.sk'), '🇸🇰')}
			</div>
		</DropdownMenu.Content>
	</form>
</DropdownMenu.Root>
