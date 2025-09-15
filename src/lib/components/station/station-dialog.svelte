<script lang="ts">
	import Chart from '@/components/measurements/chart.svelte';
	import * as Dialog from '@/components/ui/dialog';
	import { Map } from '@/components/ui/map';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Tabs from '@/components/ui/tabs';
	import { api } from '@/shared';
	import type { ListResponse, Measurement, MeasurementStat, Station } from '@/shared/types';
	import { t } from '@/translations';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { Calendar, Droplets, MapPin, Maximize, Minimize, Thermometer, X } from 'lucide-svelte';
	import StatsChart from '../measurements/stats-chart.svelte';
	import Button, { buttonVariants } from '../ui/button/button.svelte';
	import { globalState } from '@/shared/runes.svelte';

	interface Props {
		open: boolean;
		station?: Station;
	}

	let { open = $bindable(), station }: Props = $props();

	const startOfWeek = dayjs().subtract(6, 'days').startOf('day');
	const endOfWeek = dayjs().endOf('day');
	const startDate = startOfWeek.format('YYYY-MM-DD');
	const endDate = endOfWeek.format('YYYY-MM-DD');

	const weekStatsQuery = $derived(
		createQuery({
			queryKey: ['weekStats', station?.id, startDate, endDate],
			queryFn: () => api.getMeasurementStats(station!.id, startDate, endDate),
			enabled: !!station?.id && open,
			select: (data) =>
				data.map((stat) => ({
					...stat,
					date: dayjs(stat.date),
					temperature: parseFloat(stat.temperature.toFixed(2)),
					humidity: parseFloat(stat.humidity.toFixed(2))
				}))
		})
	);

	const latestMeasurementQuery = $derived(
		createQuery({
			queryKey: ['latestMeasurement', station?.id],
			queryFn: () => api.getLatestMeasurement(station!.id),
			enabled: !!station?.id && open,
			select: (data) => ({
				...data,
				temperature: parseFloat(data.temperature.toFixed(2)),
				humidity: parseFloat(data.humidity.toFixed(2)),
				timestamp: dayjs(data.timestamp)
			})
		})
	);

	const createChartData = (key: 'temperature' | 'humidity') =>
		$weekStatsQuery.data?.map((data) => ({
			date: data.date.toDate(),
			value: data[key]
		}));

	function onOpenChangeComplete(open: boolean) {
		if (!open) {
			isMaximized = false;
			activeTab = 'overview';
		}
	}

	const tempChartData = $derived(createChartData('temperature'));
	const humChartData = $derived(createChartData('humidity'));

	let activeTab = $state('overview');
	let isMaximized = $state(false);
</script>

<Dialog.Root bind:open {onOpenChangeComplete}>
	<Dialog.MobileContent
		class={[
			'max-w-4xl [&>button]:hidden',
			{ 'h-[100vh] w-screen! max-w-none! rounded-none border-0': isMaximized }
		]}
	>
		<Dialog.Header class="flex w-full flex-row justify-between">
			<div class="flex w-fit flex-col space-y-2">
				<Dialog.Title class="flex items-center gap-2">
					<MapPin class="size-5" />
					{station?.name}
				</Dialog.Title>
				<Dialog.Description>
					{station?.city_name}
				</Dialog.Description>
			</div>
			<div class="flex gap-2">
				{#if !globalState.isMobile.value}
					<Button variant="ghost" size="icon" onclick={() => (isMaximized = !isMaximized)}>
						{#if isMaximized}
							<Minimize class="size-4" />
						{:else}
							<Maximize class="size-4" />
						{/if}
					</Button>
				{/if}
				<Dialog.Close class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
					<X class="size-4" />
				</Dialog.Close>
			</div>
		</Dialog.Header>

		{#if station}
			<Tabs.Root value={activeTab} onValueChange={(value) => (activeTab = value)}>
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger value="overview">{$t('dash.station.dialog.tabs.overview')}</Tabs.Trigger>
					<Tabs.Trigger value="charts">{$t('dash.station.dialog.tabs.charts')}</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content
					value="overview"
					class={{ 'space-y-5': !isMaximized, 'space-y-10': isMaximized }}
				>
					<!-- Map Section -->
					{#if station.latitude && station.longitude}
						<div class="space-y-2">
							<h3 class="text-lg font-semibold">{$t('dash.station.dialog.location')}</h3>
							<div class="w-full overflow-hidden rounded-lg border">
								{#key isMaximized}
									<Map
										class="h-[300px] w-full"
										latitude={station.latitude}
										longitude={station.longitude}
										zoom={15}
										preview
									/>
								{/key}
							</div>
						</div>
					{/if}

					<!-- Latest Measurement -->
					<div class="space-y-2">
						<h3 class="text-lg font-semibold">{$t('dash.station.dialog.latestMeasurement')}</h3>
						{#if $latestMeasurementQuery.isLoading}
							<div class="flex gap-4">
								<Skeleton class="h-16 w-full" />
								<Skeleton class="h-16 w-full" />
							</div>
						{:else if $latestMeasurementQuery.data}
							<div class="grid grid-cols-2 gap-4">
								<div class="flex items-center gap-3 rounded-lg border p-4">
									<Thermometer class="text-primary size-8" />
									<div>
										<p class="text-2xl font-bold">
											{$latestMeasurementQuery.data.temperature}°C
										</p>
										<p class="text-muted-foreground text-sm">
											{$t('measurements.temperature')}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-3 rounded-lg border p-4">
									<Droplets class="size-8 text-blue-500" />
									<div>
										<p class="text-2xl font-bold text-blue-500">
											{$latestMeasurementQuery.data.humidity}%
										</p>
										<p class="text-muted-foreground text-sm">
											{$t('measurements.humidity')}
										</p>
									</div>
								</div>
							</div>
							<p class="text-muted-foreground flex items-center gap-1 text-sm">
								<Calendar class="size-4" />
								{$t('measurements.lastUpdated')}: {$latestMeasurementQuery.data.timestamp.format(
									'MMM D, HH:mm'
								)}
							</p>
						{:else}
							<p class="text-muted-foreground">{$t('dash.station.dialog.noMeasurements')}</p>
						{/if}
					</div>
				</Tabs.Content>

				<Tabs.Content value="charts" class="space-y-6">
					{#if $weekStatsQuery.isLoading}
						<div class="space-y-4">
							<Skeleton class="h-[300px] w-full" />
							<Skeleton class="h-[300px] w-full" />
						</div>
					{:else if tempChartData && humChartData && tempChartData.length > 0 && humChartData.length > 0}
						<StatsChart
							chartData={tempChartData}
							lineColor="red"
							suffix="°C"
							title={$t('measurements.chart.temperature')}
						/>
						<StatsChart
							chartData={humChartData}
							lineColor="purple"
							suffix="%"
							title={$t('measurements.chart.humidity')}
						/>
					{:else}
						<div class="flex h-32 items-center justify-center">
							<p class="text-muted-foreground">{$t('dash.station.dialog.noChartData')}</p>
						</div>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		{/if}
	</Dialog.MobileContent>
</Dialog.Root>
