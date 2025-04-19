<script lang="ts">
	import * as Popover from '@/components/ui/popover';
	import { buttonVariants } from '@/components/ui/button';
	import Button from '../button/button.svelte';
	import { cn } from '@/utils';
	import dayjs, { type Dayjs } from 'dayjs';
	import { goto } from '$app/navigation';
	import { setParam } from '@/shared';

	type Props = {
		dates: Dayjs[];
		selected: string;
	};

	let { dates, selected }: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger
		class={cn(
			buttonVariants({
				variant: 'outline'
			}),
			'hover:bg-muted/50 w-full transition-colors'
		)}
	>
		{dayjs(selected).format('dddd')}
	</Popover.Trigger>
	<Popover.Content class="flex w-full items-center justify-center gap-x-1.5 rounded-lg p-2">
		{#each dates as date}
			<Button
				variant="ghost"
				size="sm"
				class={cn('rounded-md transition-all duration-200', {
					'bg-secondary font-medium': date.isSame(selected, 'day'),
					'hover:bg-muted/80': !date.isSame(selected, 'day')
				})}
				onclick={() => setParam('date', date.toISOString())}
			>
				{date.format('ddd')}
			</Button>
		{/each}
	</Popover.Content>
</Popover.Root>
