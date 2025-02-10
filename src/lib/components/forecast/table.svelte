<script lang="ts">
  import * as Table from '@/components/ui/table';
	import type { ForecastBase, ForecastTransformed } from '@/shared/types';
	import dayjs from 'dayjs';

	interface Props {
		forecast: ForecastTransformed[];
	}

	const { forecast }: Props = $props();

  const displayTime = (item: ForecastBase) => item.time.isSame(dayjs(), 'day')
    ? 'Today'
    : item.time.format('ddd');
</script>

<Table.Root>
  <Table.Body>
    {#each forecast as item}
      <Table.Row>
        <Table.Cell>{displayTime(item)}</Table.Cell>
        <Table.Cell>
          <item.icon />
        </Table.Cell>
        <Table.Cell>{Math.round(item.temperature_max)}°</Table.Cell>
        <Table.Cell class="text-muted-foreground">{Math.round(item.temperature_min)}°</Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
