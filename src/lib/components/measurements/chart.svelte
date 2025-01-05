<script lang="ts">
	import type { ListResponse, Measurement } from '@/shared/types';
	import type { CreateQueryResult } from '@tanstack/svelte-query';
	import { scaleTime } from 'd3-scale';
	import dayjs from 'dayjs';
	import { Area, Axis, Chart, Highlight, Svg, Tooltip } from 'layerchart';

	interface Props {
		dataQuery: CreateQueryResult<ListResponse<Measurement>, Error>;
	}

	const { dataQuery }: Props = $props();

	const chartData = $derived(
		$dataQuery.data?.results.map((data) => ({
			date: new Date(data.timestamp),
			value: data.temperature
		}))
	);
</script>

<div class="w-[700px] h-[300px] rounded border p-4">
	<Chart
		data={chartData}
		x="date"
		xScale={scaleTime()}
		y="value"
		yDomain={[0, null]}
		yNice
		padding={{ left: 16, bottom: 24 }}
		tooltip={{ mode: 'bisect-x' }}
	>
		<Svg>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" format={(d) => dayjs(d).format('HH:mm')} rule />
			<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
			<Highlight points lines />
		</Svg>

		<Tooltip.Root let:data>
			<Tooltip.Header>{dayjs(data.d).format('ddd, MMMM D')}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		</Tooltip.Root>
	</Chart>
</div>
