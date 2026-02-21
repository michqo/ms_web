<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { api } from '@/shared';
	import { globalState } from '@/shared/runes.svelte';
	import type { Measurement } from '@/shared/types';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { CheckCircle2, ChevronDown, Droplets, Thermometer, X } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { buttonVariants } from '../button';
	import * as Dialog from '../dialog';
	import { Skeleton } from '../skeleton';

	const stationsQuery = createQuery({
		queryKey: ['stations'],
		queryFn: () => api.getStations(),
		refetchOnWindowFocus: false
	});

	let latestMeasurements = $state<Record<number, Measurement | null>>({});
	let loadingMeasurements = $state<Record<number, boolean>>({});

	$effect(() => {
		if ($stationsQuery.data?.results.length) {
			fetchAllLatestMeasurements();
		}
	});

	async function fetchAllLatestMeasurements() {
		if (!$stationsQuery.data?.results.length) return;

		try {
			for (const station of $stationsQuery.data.results) {
				if (latestMeasurements[station.id] !== undefined) continue;

				try {
					loadingMeasurements[station.id] = true;
					const measurement = await api.getLatestMeasurement(station.id);
					measurement.timestamp = dayjs(measurement.timestamp);
					latestMeasurements[station.id] = measurement || null;
				} catch (error) {
					console.error(`Error fetching measurement for station ${station.id}:`, error);
					latestMeasurements[station.id] = null;
				} finally {
					loadingMeasurements[station.id] = false;
				}
			}
		} catch (error) {
			console.error('Error fetching measurements:', error);
		}
	}

	function setSelectedStation(stationId: number) {
		globalState.stationId = stationId;
		toast.success($t('menu.actions.selector.success'));
		invalidateAll();
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost', class: 'h-auto gap-3 px-2 py-1.5' })}>
		<img src="/favicon.png" alt="logo" class="size-9 rounded-xl" />
		{#if globalState.station}
			<div class="flex flex-col items-start gap-0.5 leading-none">
				<span class="text-sm font-semibold">{globalState.station.name}</span>
				<span class="text-muted-foreground text-[10px]">{globalState.station.city_name}</span>
			</div>
			<ChevronDown class="ml-1 size-4 shrink-0 opacity-40" />
		{:else if $stationsQuery.isPending}
			<div class="flex flex-col items-start gap-1 leading-none">
				<Skeleton class="h-3 w-20" />
				<Skeleton class="h-2 w-12" />
			</div>
		{/if}
	</Dialog.Trigger>
	<Dialog.MobileContent class="flex max-w-4xl flex-col sm:max-h-[90vh] [&>button]:hidden">
		<Dialog.Header class="flex w-full flex-row justify-between">
			<div class="flex flex-col space-y-2">
				<Dialog.Title class="w-fit">{$t('menu.actions.selector.label')}</Dialog.Title>
				<Dialog.Description>
					{$t('menu.actions.selector.action')}
				</Dialog.Description>
			</div>
			<Dialog.Close class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
				<X class="size-4" />
			</Dialog.Close>
		</Dialog.Header>
		<div class="mt-4 grid grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
			{#if $stationsQuery.isPending}
				{#each Array(4) as _}
					<div class="border-border flex w-full flex-col gap-2 rounded-xl border p-4">
						<Skeleton class="h-4 w-1/2 rounded-md" />
						<Skeleton class="h-3 w-1/3 rounded-md" />
						<div class="mt-4 flex gap-4 border-t border-black/[0.03] pt-3 dark:border-white/[0.03]">
							<Skeleton class="h-8 w-16 rounded-lg" />
							<Skeleton class="h-8 w-16 rounded-lg" />
						</div>
					</div>
				{/each}
			{:else if $stationsQuery.data?.results}
				{#each $stationsQuery.data.results as station}
					{@const latest = latestMeasurements[station.id]}
					{@const loading = loadingMeasurements[station.id]}
					{@const isSelected = globalState.stationId === station.id}
					<button
						class={cn([
							'group relative flex w-full flex-col items-start gap-1 overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98]',
							isSelected
								? 'border-primary bg-primary/5 shadow-sm'
								: 'border-border hover:bg-accent hover:border-accent-foreground/20'
						])}
						onclick={() => setSelectedStation(station.id)}
					>
						{#if isSelected}
							<CheckCircle2 class="text-primary absolute top-3 right-3 size-4" />
						{/if}
						<div class="z-10 flex w-full items-center justify-between">
							<div class="flex flex-col">
								<span class="text-sm font-bold tracking-tight">{station.name}</span>
								<span
									class="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase opacity-60"
									>{station.city_name}</span
								>
							</div>
						</div>

						<div
							class="mt-3 flex w-full gap-4 border-t border-black/[0.03] pt-3 dark:border-white/[0.03]"
						>
							<div class="flex items-center gap-2">
								<div class="rounded-lg bg-orange-500/20 p-1.5 transition-colors">
									<Thermometer class="size-3.5 text-orange-500" />
								</div>
								{#if loading}
									<Skeleton class="h-4 w-10 rounded-md" />
								{:else if latest}
									<span class="text-sm font-bold tabular-nums"
										>{Math.round(latest.temperature!)}°C</span
									>
								{:else}
									<span class="text-muted-foreground text-xs font-semibold"
										>{$t('dash.noData')}</span
									>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<div class="rounded-lg bg-cyan-500/20 p-1.5 transition-colors">
									<Droplets class="size-3.5 text-cyan-600 dark:text-cyan-400" />
								</div>
								{#if loading}
									<Skeleton class="h-4 w-10 rounded-md" />
								{:else if latest}
									<span class="text-sm font-bold tabular-nums">{latest.humidity}%</span>
								{:else}
									<span class="text-muted-foreground text-xs font-semibold"
										>{$t('dash.noData')}</span
									>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</Dialog.MobileContent>
</Dialog.Root>
