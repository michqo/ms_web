<script lang="ts">
  import * as Popover from '@/components/ui/popover';
  import {buttonVariants} from '@/components/ui/button';
	import Button from '../button/button.svelte';
	import { cn } from '@/utils';
	import dayjs, { type Dayjs } from 'dayjs';
	import { goto } from '$app/navigation';

  type Props = {
    dates: Dayjs[];
    selected: string;
  }

  let { dates, selected }: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger class={cn(buttonVariants({
    variant: "outline",
  }), 'w-full')}>
    {dayjs(selected).format('dddd')}
  </Popover.Trigger>
  <Popover.Content class="p-0 flex w-full items-center gap-x-1">
    {#each dates as date}
      <Button
        variant="ghost"
        class={cn({
          'bg-secondary': date.isSame(selected, 'day'),
        })}
        onclick={() => goto(`?date=${date.toISOString()}`)}
      >
        {date.format('ddd')}
      </Button>
    {/each}
  </Popover.Content>
</Popover.Root>
