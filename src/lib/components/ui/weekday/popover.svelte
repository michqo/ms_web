<script lang="ts">
  import * as Popover from '@/components/ui/popover';
  import {buttonVariants} from '@/components/ui/button';
	import Button from '../button/button.svelte';
	import { cn } from '@/utils';

  type Props = {
    dates: string[];
    selected?: string;
  }
  
  let { dates, selected = $bindable() }: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger class={cn(buttonVariants({
    variant: "outline",
  }), 'w-full')}>
    Thu
  </Popover.Trigger>
  <Popover.Content class="p-0 flex w-full items-center gap-x-1">
    {#each dates as date}
      <Button
        variant="ghost"
        class={{
          'bg-primary-500 text-white': date === selected,
        }}
        onclick={() => selected = date}
      >
        {date}
      </Button>
    {/each}
  </Popover.Content>
</Popover.Root>
