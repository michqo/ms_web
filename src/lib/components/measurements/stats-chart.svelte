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
</script>

<div class="relative h-[300px] w-full rounded-lg border bg-background p-5 shadow-xs">
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
				format={(v) => `${v}${suffix}`}
			/>
			<Axis
				placement="bottom"
				format={(d) => dayjs(d).format('ddd')}
				rule={{ class: 'stroke-border' }}
			/>
			<Spline class="stroke-2 {lineColors[lineColor]}" />
			<Labels format="decimal" />
		</Svg>
	</Chart>
</div>
