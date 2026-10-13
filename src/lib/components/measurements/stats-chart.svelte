<script lang="ts">
	import type { ChartData } from '@/shared/types';
	import { scaleTime } from 'd3-scale';
	import { curveLinear } from 'd3-shape';
	import dayjs from 'dayjs';
	import { Axis, Chart, Spline, Svg } from 'layerchart';
	import { locale } from '@/translations';
	let {
		chartData,
		suffix = '',
		title = '',
		intraday = false
	}: {
		chartData: ChartData[];
		lineColor?: string;
		suffix?: string;
		title?: string;
		intraday?: boolean;
	} = $props();
</script>

<div class="weather-chart" role="img" aria-label={title}>
	<Chart
		data={chartData}
		x="date"
		xScale={scaleTime()}
		y="value"
		yNice
		padding={{ left: 42, bottom: 26, top: 16, right: 16 }}
	>
		<Svg
			><Axis
				placement="left"
				grid
				rule={{ class: 'stroke-border' }}
				format={(v) => `${v}${suffix}`}
			/><Axis
				placement="bottom"
				ticks={4}
				format={(d) =>
					dayjs(d)
						.utc()
						.locale($locale)
						.format(intraday ? 'HH:mm' : 'D MMM')}
				rule={{ class: 'stroke-border' }}
			/><Spline curve={curveLinear} class="stroke-primary stroke-2" /></Svg
		>
	</Chart>
</div>
