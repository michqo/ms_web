<script lang="ts">
	import { t, locale } from '@/translations';
	import { getApi, getGlobalState } from '@/shared/runes.svelte';
	import { dayOptions } from '@/shared/queries';
	import { formatReading, type Metric } from '@/shared/weather';
	import { createQuery } from '@tanstack/svelte-query';
	import { toStore } from 'svelte/store';
	import * as Dialog from '@/components/ui/dialog';
	import Trend from './Trend.svelte';
	import dayjs from 'dayjs';
	const appState = getGlobalState();
	const api = getApi();
	let { day, metric, onClose }: { day: string | null; metric: Metric; onClose: () => void } =
		$props();
	let open = $state(false);
	let tablePage = $state(1);
	let shownDay = $state<string | null>(null);
	$effect(() => {
		open = !!day;
		if (day) shownDay = day;
		day;
		appState.stationId;
		tablePage = 1;
	});
	const query = createQuery(toStore(() => dayOptions(api, appState, shownDay, !!day)));
	const data = $derived($query.data ?? []);
	const chart = $derived(data.map((d) => ({ date: d.timestamp.toDate(), value: d[metric] })));
	const pages = $derived(Math.max(1, Math.ceil(data.length / 24)));
</script>

<Dialog.Root
	bind:open
	onOpenChange={(value) => {
		if (!value) onClose();
	}}
	><Dialog.Content class="day-detail sm:max-w-3xl"
		><Dialog.Header
			><Dialog.Title
				>{appState.station?.name} · {shownDay
					? dayjs.utc(shownDay).locale($locale).format('D MMM YYYY')
					: ''}</Dialog.Title
			><Dialog.Description
				>{$t('weather.completeDay')} · {data.length} {$t('weather.readings')}</Dialog.Description
			></Dialog.Header
		>
		{#if $query.isError && !data.length}<div class="state-message" role="alert">
				<p>{$t('weather.dayError')}</p>
				<button class="weather-button" onclick={() => $query.refetch()}
					>{$t('weather.retry')}</button
				>
			</div>{:else}
			<Trend
				data={chart}
				{metric}
				intraday
				pending={$query.isPending}
				error={$query.isError}
				onRetry={() => $query.refetch()}
			/>
			{#if data.length}<div class="weather-table-wrap">
					<table class="weather-table">
						<caption class="sr-only">{$t('weather.completeDay')}</caption><thead
							><tr
								><th scope="col">{$t('weather.time')}</th><th scope="col"
									>{$t('weather.temperature')} (°C)</th
								><th scope="col">{$t('weather.humidity')} (%)</th></tr
							></thead
						><tbody
							>{#each data.slice((tablePage - 1) * 24, tablePage * 24) as row}<tr
									><th scope="row"
										><time datetime={row.timestamp.toISOString()}
											>{row.timestamp.utc().format('HH:mm:ss')}</time
										></th
									><td>{formatReading(row.temperature, $locale)}</td><td
										>{formatReading(row.humidity, $locale)}</td
									></tr
								>{/each}</tbody
						>
					</table>
				</div>
				{#if pages > 1}<div class="table-pagination">
						<button class="weather-button" disabled={tablePage === 1} onclick={() => tablePage--}
							>{$t('weather.previousPage')}</button
						><span aria-live="polite">{tablePage} / {pages}</span><button
							class="weather-button"
							disabled={tablePage === pages}
							onclick={() => tablePage++}>{$t('weather.nextPage')}</button
						>
					</div>{/if}{/if}{/if}
	</Dialog.Content></Dialog.Root
>
