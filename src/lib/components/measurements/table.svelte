<script lang="ts">
  import * as Table from '@/components/ui/table';
	import dayjs from 'dayjs';
	import Pagination from '@/components/Pagination.svelte';
	import type { ListResponse, Measurement } from '@/shared/types';
	import type { CreateQueryResult } from '@tanstack/svelte-query';

  interface Props {
    pageNumber: number;
    onPageChange: (page: number) => void;
    dataQuery: CreateQueryResult<ListResponse<Measurement>, Error>;
  }
  
  const { pageNumber, onPageChange, dataQuery }: Props = $props();
</script>

<Table.Root class="w-screen max-w-sm">
  <Table.Header>
    <Table.Row>
      <Table.Cell>Time</Table.Cell>
      <Table.Cell>Temperature</Table.Cell>
      <Table.Cell>Humidity</Table.Cell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each $dataQuery.data!.results as measurement}
      <Table.Row>
        <Table.Cell>{dayjs(measurement.timestamp).format("HH:mm")}</Table.Cell>
        <Table.Cell>{measurement.temperature}</Table.Cell>
        <Table.Cell>{measurement.humidity}</Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
<Pagination page={pageNumber} count={$dataQuery.data!.count} {onPageChange} />
