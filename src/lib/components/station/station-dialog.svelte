<script lang="ts">
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import * as Dialog from '@/components/ui/dialog';
	import * as Form from '@/components/ui/form';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import { Map } from '@/components/ui/map';
	import { Skeleton } from '@/components/ui/skeleton';
	import * as Tabs from '@/components/ui/tabs';
	import { api, transformForecast } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import { stationSchema } from '@/shared/schemas';
	import type { Station } from '@/shared/types';
	import { t } from '@/translations';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import {
		Calendar,
		Droplets,
		Edit,
		MapPin,
		Maximize,
		Minimize,
		Thermometer,
		Trash2,
		X
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import StatsChart from '../measurements/stats-chart.svelte';
	import Button, { buttonVariants } from '../ui/button/button.svelte';
	import MiniForecastCard from '../forecast/mini-card.svelte';

	interface Props {
		open: boolean;
		station?: Station;
		startInEditMode?: boolean;
	}

	let { open = $bindable(), station, startInEditMode = false }: Props = $props();

	const client = useQueryClient();
	const isNewStation = !station;

	let editMode = $state(isNewStation || startInEditMode);
	let deleteDialogOpen = $state(false);

	const form = superForm(
		{
			name: station?.name || '',
			latitude: station?.latitude || 48.1,
			longitude: station?.longitude || 17.1
		},
		{
			SPA: true,
			validators: zodClient(stationSchema),
			onUpdate: async ({ form: f }) => {
				if (f.valid) {
					try {
						if (isNewStation) {
							await api.createStation(f.data);
							toast.success($t('dash.dialog.messages.createSuccess'));
						} else {
							await api.updateStation(station?.id!, f.data);
							toast.success($t('dash.dialog.messages.updateSuccess'));
						}
						await client.invalidateQueries({ queryKey: ['stations'] });
						open = false;
					} catch (error) {
						toast.error(
							isNewStation
								? $t('dash.dialog.messages.createError')
								: $t('dash.dialog.messages.updateError')
						);
					}
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	async function deleteStation() {
		try {
			await api.deleteStation(station?.id!);
			toast.success($t('dash.dialog.messages.deleteSuccess'));
			deleteDialogOpen = false;
			open = false;
			await client.invalidateQueries({ queryKey: ['stations'] });
		} catch (error) {
			toast.error($t('dash.dialog.messages.deleteError'));
		}
	}

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

	const forecastQuery = $derived(
		createQuery({
			queryKey: ['forecast', station?.id],
			queryFn: () => api.getForecast(station!.id),
			enabled: !!station?.id && open && !editMode,
			select: (data) => ({
				...data,
				created_at: dayjs(data.created_at),
				results: transformForecast(data)
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
			editMode = isNewStation || startInEditMode;
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
			'[&>button]:hidden',
			{ 'h-screen! max-h-none! w-screen! max-w-none! rounded-none border-0': isMaximized }
		]}
	>
		<Dialog.Header class="flex w-full flex-row justify-between">
			<div class="flex w-fit flex-col space-y-2">
				<Dialog.Title class="flex items-center gap-2">
					{#if !editMode}
						<MapPin class="size-5" />
						{station?.name}
					{:else}
						{isNewStation
							? $t('dash.dialog.createStation.title')
							: $t('dash.dialog.manageStation.title')}
					{/if}
				</Dialog.Title>
				<Dialog.Description>
					{#if !editMode}
						{station?.city_name}
					{:else}
						{isNewStation
							? $t('dash.dialog.createStation.description')
							: $t('dash.dialog.manageStation.description')}
					{/if}
				</Dialog.Description>
			</div>
			<div class="flex gap-2">
				{#if !isNewStation && !editMode && !globalState.isMobile.value}
					<Button variant="ghost" size="icon" onclick={() => (isMaximized = !isMaximized)}>
						{#if isMaximized}
							<Minimize class="size-4" />
						{:else}
							<Maximize class="size-4" />
						{/if}
					</Button>
				{/if}
				{#if globalState.user && !isNewStation}
					<Button
						variant="ghost"
						size="icon"
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							editMode = !editMode;
						}}
					>
						<Edit class="h-4 w-4" />
					</Button>
				{/if}
				<Dialog.Close class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
					<X class="size-4" />
				</Dialog.Close>
			</div>
		</Dialog.Header>

		<div class="overflow-y-auto pr-1">
			{#if editMode}
				<form method="POST" use:enhance class="space-y-4">
					<Form.Field {form} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{$t('dash.dialog.createStation.form_name')}</Form.Label>
								<Input {...props} bind:value={$formData.name} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<div class="mt-4 space-y-2">
						<Label>{$t('dash.dialog.createStation.form_location')}</Label>
						<Map bind:latitude={$formData.latitude} bind:longitude={$formData.longitude} />
					</div>

					<Dialog.Footer class="flex-col pt-4 sm:flex-row sm:justify-between">
						{#if !isNewStation}
							<Button type="button" variant="destructive" onclick={() => (deleteDialogOpen = true)}>
								<Trash2 class="mr-2 h-4 w-4" />
								{$t('dash.dialog.manageStation.delete')}
							</Button>
						{:else}
							<div></div>
						{/if}

						<div class="mt-2 flex gap-2 sm:mt-0">
							<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}>
								{$t('dash.dialog.manageStation.cancel')}
							</Dialog.Close>
							<Form.Button type="submit"
								>{isNewStation
									? $t('dash.dialog.createStation.create')
									: $t('dash.dialog.manageStation.update')}</Form.Button
							>
						</div>
					</Dialog.Footer>
				</form>
			{:else if station}
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
											class={['w-full', { 'h-[500px]': isMaximized, 'h-[250px]': !isMaximized }]}
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

						<!-- Forecast -->
						<div class="space-y-2">
							<h3 class="text-lg font-semibold">{$t('dash.station.dialog.forecast')}</h3>
							{#if $forecastQuery.isLoading}
								<Skeleton class="h-24 w-full" />
							{:else if $forecastQuery.data}
								<MiniForecastCard forecast={$forecastQuery.data.results[0]} />
							{:else}
								<p class="text-muted-foreground">{$t('dash.station.dialog.noForecast')}</p>
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
		</div>
	</Dialog.MobileContent>
</Dialog.Root>

{#if !isNewStation}
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Content
			class={[
				'flex flex-col sm:max-w-md',
				{ 'h-[100vh] w-screen max-w-none rounded-none border-0': globalState.isMobile.value }
			]}
		>
			<AlertDialog.Header>
				<AlertDialog.Title>{$t('dash.dialog.manageStation.confirm_title')}</AlertDialog.Title>
				<AlertDialog.Description>
					{$t('dash.dialog.manageStation.confirm_description')}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>{$t('dash.dialog.manageStation.cancel')}</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={deleteStation}
					class="bg-destructive text-destructive-foreground"
				>
					{$t('dash.dialog.manageStation.delete')}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
