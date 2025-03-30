<script lang="ts">
	import type { ChartData } from '@/shared/types';
	import { scaleTime } from 'd3-scale';
	import dayjs from 'dayjs';
	import { Axis, Chart, Highlight, Labels, Spline, Svg, Tooltip } from 'layerchart';

	type LineColor = 'red' | 'purple' | 'blue' | 'green' | 'orange';

	interface Props {
		chartData: ChartData[];
		lineColor: LineColor;
		suffix?: string;
		title?: string;
	}

	const lineColors: Record<LineColor, string> = {
		red: 'stroke-red-500',
		purple: 'stroke-purple-500',
		blue: 'stroke-blue-500',
		green: 'stroke-green-500',
		orange: 'stroke-orange-500'
	};

	const { chartData, lineColor, suffix = '', title = '' }: Props = $props();

	function formatValue(value: number): string {
		return `${value.toFixed(2)}${suffix}`;
	}
</script>

<div class="relative h-[300px] w-full rounded-lg border bg-background p-5 shadow-sm">
	{#if title}
		<div class="absolute left-3 top-2 text-sm font-medium text-muted-foreground">
			{title}
		</div>
	{/if}

	<Chart
		data={chartData}
		x="date"
		xScale={scaleTime()}
		y="value"
		yNice
		padding={{ left: 40, bottom: 24, top: 20, right: 20 }}
		tooltip={{ mode: 'bisect-x' }}
	>
		<Svg>
			<Axis
				placement="left"
				grid
				rule={{ class: 'stroke-border' }}
				format={(v) => formatValue(v)}
			/>
			<Axis
				placement="bottom"
				format={(d) => dayjs(d).format('ddd')}
				rule={{ class: 'stroke-border' }}
				ticks={7}
			/>
			<Spline class="stroke-2 {lineColors[lineColor]}" />
			<Labels format="integer" />
			<Highlight points={{ class: `fill-background stroke-2 ${lineColors[lineColor]}` }} lines />
		</Svg>

		<Tooltip.Root let:data>
			<Tooltip.Header>{dayjs(data.date).format('ddd, MMMM D')}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="Value" value={formatValue(data.value)} />
			</Tooltip.List>
		</Tooltip.Root>
	</Chart>
</div>
