<script lang="ts">
	import * as Dialog from '@/components/ui/dialog';
	import { t } from '@/translations';
	import { getApi, getGlobalState } from '@/shared/runes.svelte';
	import { invalidateWeather } from '@/shared/queries';
	import { useQueryClient } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import { toast } from 'svelte-sonner';
	const appState = getGlobalState();
	const api = getApi();
	const client = useQueryClient();
	let {
		open = $bindable(),
		stationId,
		from,
		to
	}: { open: boolean; stationId: number; from: string; to: string } = $props();
	let busy = $state(false);
	let error = $state(false);
	async function remove() {
		if (
			busy ||
			appState.demo ||
			appState.station?.id !== stationId ||
			appState.station.user !== appState.user?.id
		)
			return;
		busy = true;
		error = false;
		try {
			await api.deleteMeasurements(
				stationId,
				dayjs.utc(from).startOf('day').subtract(1, 'millisecond').toISOString(),
				dayjs.utc(to).endOf('day').add(1, 'millisecond').toISOString()
			);
			await invalidateWeather(client, appState);
			open = false;
			toast.success($t('weather.deleted'));
		} catch {
			error = true;
		} finally {
			busy = false;
		}
	}
</script>

<Dialog.Root bind:open
	><Dialog.Content class="sm:max-w-md"
		><Dialog.Header
			><Dialog.Title>{$t('weather.deleteTitle')}</Dialog.Title><Dialog.Description
				>{$t('weather.deleteScope')}</Dialog.Description
			></Dialog.Header
		>
		<p class="deletion-scope"><strong>{appState.station?.name}</strong><br />{from} – {to} · UTC</p>
		{#if error}<p role="alert" class="weather-error">{$t('weather.deleteError')}</p>{/if}
		<div class="dialog-actions">
			<Dialog.Close class="weather-button" disabled={busy}>{$t('weather.cancel')}</Dialog.Close
			><button class="weather-button danger" disabled={busy} onclick={remove}
				>{$t('weather.deleteConfirm')}</button
			>
		</div></Dialog.Content
	></Dialog.Root
>
