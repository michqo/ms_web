<script lang="ts">
	import type { ChartData } from '@/shared/types';
	import { t } from '@/translations';
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

<div class="relative h-[300px] w-full rounded-lg border bg-background p-5 shadow-sm">
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
				format={(d) => dayjs(d).format('HH:00')}
				rule={{ class: 'stroke-border' }}
			/>
			<Spline class="stroke-2 {lineColors[lineColor]}" />
			<Labels format="integer" />
			<Highlight points={{ class: `fill-background stroke-2 ${lineColors[lineColor]}` }} lines />
		</Svg>

		<Tooltip.Root let:data>
			<Tooltip.Header>{dayjs(data.date).format('ddd, MMMM D HH:00')}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label={$t('measurements.chart.label')} value={data.value + suffix} />
			</Tooltip.List>
		</Tooltip.Root>
	</Chart>
</div>
