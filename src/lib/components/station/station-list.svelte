<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { Skeleton } from '@/components/ui/skeleton';
	import { t } from '@/translations';
	import { cn } from '@/utils';
	import type { Station } from '@/shared/types';
	import { AlertCircle, CheckCircle2, Edit, Plus } from 'lucide-svelte';

	interface Props {
		stations: Station[];
		pending: boolean;
		error: boolean;
		showSearch?: boolean;
		showCreate?: boolean;
		selectedStationId: number | null;
		search: string;
		onSelect: (stationId: number) => void;
		onEdit?: (station: Station) => void;
		onCreate?: () => void;
	}

	let {
		stations,
		pending,
		error,
		showSearch = true,
		showCreate = false,
		selectedStationId,
		search = $bindable(''),
		onSelect,
		onEdit,
		onCreate
	}: Props = $props();
</script>

<div class="flex items-center gap-2">
	{#if showSearch}
		<Input
			type="text"
			placeholder={$t('dash.searchPlaceholder')}
			bind:value={search}
			class="h-8 w-40 font-mono text-xs"
		/>
	{/if}
	{#if showCreate && onCreate}
		<Button variant="default" size="sm" class="gap-1.5" onclick={onCreate}>
			<Plus class="size-3.5" />
			{$t('dash.dialog.createStation.trigger')}
		</Button>
	{/if}
</div>

<div class="mt-4 grid grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
	{#if pending}
		{#each Array(4) as _}
			<div class="border-border flex w-full flex-col gap-2 rounded-xl border p-5">
				<Skeleton class="h-5 w-1/2 rounded-md" />
				<Skeleton class="h-4 w-1/3 rounded-md" />
				<div class="mt-3 flex gap-4 border-t border-black/[0.03] pt-3 dark:border-white/[0.03]">
					<Skeleton class="h-8 w-16 rounded-lg" />
					<Skeleton class="h-8 w-16 rounded-lg" />
				</div>
			</div>
		{/each}
	{:else if error}
		<div
			class="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
		>
			<AlertCircle class="mb-2 size-4" />
			<p class="text-sm font-semibold">{$t('dash.status.apiUnavailable')}</p>
			<p class="text-xs">{$t('dash.status.apiUnavailableHint')}</p>
		</div>
	{:else if stations.length === 0}
		<div class="text-muted-foreground col-span-full py-10 text-center font-mono text-xs">
			{$t('dash.noStationsFound')}
		</div>
	{:else}
		{#each stations as station}
			{@const isSelected = selectedStationId === station.id}
			<button
				class={cn([
					'group border-border/50 relative flex w-full flex-col items-start gap-1 overflow-hidden rounded-xl border p-5 text-left shadow-xs transition-all duration-200',
					isSelected
						? 'border-primary bg-primary/5 shadow-xs'
						: 'border-border/50 hover:bg-accent hover:border-accent-foreground/20'
				])}
				onclick={() => onSelect(station.id)}
			>
				{#if isSelected}
					<CheckCircle2 class="text-primary absolute top-3 right-3 size-4" />
				{/if}
				<div class="z-10 flex w-full items-center justify-between">
					<div class="flex flex-col">
						<span class="text-sm font-bold tracking-tight">{station.name}</span>
						<span
							class="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase opacity-60"
						>
							{station.city_name}
						</span>
					</div>
				</div>
				<div class="mt-3 flex w-full gap-2">
					{#if onEdit}
						<Button
							variant="ghost"
							size="icon"
							class="size-7"
							onclick={(e) => {
								e.stopPropagation();
								onEdit(station);
							}}
						>
							<Edit class="size-3.5" />
						</Button>
					{/if}
					<Button
						variant="ghost"
						size="sm"
						class="h-7 text-xs"
						onclick={(e) => {
							e.stopPropagation();
							onSelect(station.id);
						}}
					>
						{isSelected ? $t('dash.selected') : $t('dash.selectStation')}
					</Button>
				</div>
			</button>
		{/each}
	{/if}
</div>
