<script lang="ts">
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';

	import { resetMode, setMode, mode } from 'mode-watcher';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { buttonVariants } from '@/components/ui/button/index.js';
	import { SunMoon } from 'lucide-svelte';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<Sun
			class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
		/>
		<Moon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => setMode('light')} class={{ 'bg-secondary': $mode === 'light' }}>
			<Sun class="mr-2" /> Light
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('dark')} class={{ 'bg-secondary': $mode === 'dark' }}>
			<Moon class="mr-2" /> Dark
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => resetMode()}>
			<SunMoon class="mr-2" /> System
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
