<script lang="ts">
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import type { Snippet } from 'svelte';

	interface Props {
		icon: Snippet;
		label: string;
		content: Snippet;
	}

	const { icon, label, content }: Props = $props();
</script>

<DropdownMenu.Sub>
	<DropdownMenu.SubTrigger
		class="p-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:to-cyan-50 data-[state=open]:text-blue-700 data-[state=open]:dark:from-blue-950/50 data-[state=open]:dark:to-cyan-950/50 data-[state=open]:dark:text-blue-300"
	>
		<div class="flex items-center gap-2">
			{@render icon()}
			<span class="transition-colors">{label}</span>
		</div>
	</DropdownMenu.SubTrigger>
	<DropdownMenu.SubContent class="p-2">
		{@render content()}
	</DropdownMenu.SubContent>
</DropdownMenu.Sub>
