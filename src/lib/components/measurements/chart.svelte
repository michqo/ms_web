<script lang="ts">
	import type { ChartData } from '@/shared/types';
	import { scaleTime } from 'd3-scale';
	import dayjs from 'dayjs';
	import { Axis, Chart, Highlight, Labels, Spline, Svg, Tooltip } from 'layerchart';

	type LineColor = 'red' | 'purple';

	interface Props {
		chartData: ChartData[];
		lineColor: LineColor;
		suffix?: string;
	}

	const lineColors: Record<LineColor, string> = {
		red: 'stroke-red-500',
		purple: 'stroke-purple-500'
	};

	const { chartData, lineColor, suffix = '' }: Props = $props();
</script>

<div class="h-[300px] w-full rounded border p-5">
	<Chart
		data={chartData}
		x="date"
		xScale={scaleTime()}
		y="value"
		yNice
		padding={{ left: 16, bottom: 24 }}
		tooltip={{ mode: 'bisect-x' }}
	>
		<Svg>
			<Axis placement="left" grid rule={{ class: 'stroke-border' }} />
			<Axis
				placement="bottom"
				format={(d) => dayjs(d).format('HH:mm')}
				rule={{ class: 'stroke-border' }}
			/>
			<Spline class="stroke-2 {lineColors[lineColor]}" />
			<Labels format="integer" />
			<Highlight points lines />
		</Svg>

		<Tooltip.Root let:data>
			<Tooltip.Header>{dayjs(data.date).format('ddd, MMMM D HH:mm')}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value + suffix} />
			</Tooltip.List>
		</Tooltip.Root>
	</Chart>
</div>
