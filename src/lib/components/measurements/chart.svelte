<script lang="ts">
	import type { ChartData } from '@/shared/types';
	import { t } from '@/translations';
	import { scaleTime } from 'd3-scale';
	import dayjs from 'dayjs';
	import { Axis, Chart, Highlight, Labels, Spline, Svg, Tooltip } from 'layerchart';

	type LineColor = 'red' | 'purple' | 'blue';

	interface Props {
		chartData: ChartData[];
		lineColor: LineColor;
		suffix?: string;
		title?: string;
	}

	const lineColors: Record<LineColor, { stroke: string; fill: string; highlight: string }> = {
		red: {
			stroke: 'stroke-red-500',
			fill: 'fill-red-500/10',
			highlight: 'fill-red-500 stroke-red-600'
		},
		purple: {
			stroke: 'stroke-purple-500',
			fill: 'fill-purple-500/10',
			highlight: 'fill-purple-500 stroke-purple-600'
		},
		blue: {
			stroke: 'stroke-blue-500',
			fill: 'fill-blue-500/10',
			highlight: 'fill-blue-500 stroke-blue-600'
		}
	};

	const { chartData, lineColor, suffix = '', title }: Props = $props();
</script>

<div class="bg-background relative w-full rounded-lg border shadow-sm">
	{#if title}
		<div class="border-b px-4 py-3">
			<h3 class="text-lg font-semibold">{title}</h3>
		</div>
	{/if}

	<div class="h-[350px] w-full p-4">
		<Chart
			data={chartData}
			x="date"
			xScale={scaleTime()}
			y="value"
			yNice
			padding={{ left: 50, bottom: 40, top: 20, right: 20 }}
			tooltip={{ mode: 'bisect-x' }}
		>
			<Svg>
				<Axis
					placement="left"
					grid
					rule={{ class: 'stroke-muted-foreground/20' }}
					format={(d) => `${d}${suffix}`}
				/>
				<Axis
					placement="bottom"
					format={(d) => dayjs(d).format('HH:00')}
					rule={{ class: 'stroke-muted-foreground/20' }}
				/>

				<Spline class="stroke-2 {lineColors[lineColor].stroke}" />

				<Highlight
					points={{
						class: `${lineColors[lineColor].highlight} stroke-2`,
						r: 4
					}}
					lines={{
						class: 'stroke-muted-foreground/30 stroke-dasharray-2',
						'stroke-width': 1
					}}
				/>
			</Svg>

			<Tooltip.Root>
				{#snippet children({ data })}
					<div class="bg-background rounded-lg border p-3">
						<Tooltip.Header>
							{dayjs(data.date).format('MMM D, HH:00')}
						</Tooltip.Header>

						<Tooltip.List class="space-y-1">
							<Tooltip.Item
								label={title || $t('measurements.chart.label')}
								value="{Math.round(data.value * 10) / 10}{suffix}"
								class="flex justify-between text-sm"
							/>
						</Tooltip.List>
					</div>
				{/snippet}
			</Tooltip.Root>
		</Chart>
	</div>
</div>
