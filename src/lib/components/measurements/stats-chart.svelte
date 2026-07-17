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
		red: 'stroke-[var(--chart-4)]',
		purple: 'stroke-[var(--chart-2)]',
		blue: 'stroke-[var(--chart-1)]',
		green: 'stroke-[var(--chart-3)]',
		orange: 'stroke-[var(--chart-5)]'
	};

	const { chartData, lineColor, suffix = '', title = '' }: Props = $props();
</script>

<div
	class="border-border/50 bg-background relative h-[300px] w-full rounded-lg border p-5 shadow-xs backdrop-blur-sm"
>
	{#if title}
		<div class="text-muted-foreground absolute top-2 left-3 text-sm font-medium">
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
