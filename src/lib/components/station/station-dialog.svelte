<script lang="ts">
	import * as Dialog from '@/components/ui/dialog';
	import { getApi, getGlobalState } from '@/shared/runes.svelte';
	import { invalidateWeather } from '@/shared/queries';
	import type { Station } from '@/shared/types';
	import { t } from '@/translations';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { untrack } from 'svelte';
	import Map from '@/components/ui/map/map.svelte';
	const appState = getGlobalState();
	const api = getApi();
	const client = useQueryClient();
	let {
		open = $bindable(),
		station,
		startInEditMode = false
	}: { open: boolean; station?: Station; startInEditMode?: boolean } = $props();
	let name = $state(untrack(() => station?.name ?? ''));
	let latitude = $state(untrack(() => station?.latitude ?? 48.1486));
	let longitude = $state(untrack(() => station?.longitude ?? 17.1077));
	let mapOpen = $state(false);
	let deleting = $state(false);
	let busy = $state(false);
	let error = $state('');
	const canEdit = $derived(
		!appState.demo && !!appState.user && (!station || station.user === appState.user.id)
	);
	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (
			!canEdit ||
			busy ||
			!name.trim() ||
			!Number.isFinite(latitude) ||
			!Number.isFinite(longitude)
		)
			return;
		busy = true;
		error = '';
		try {
			const values = { name: name.trim(), latitude, longitude };
			if (station) await api.updateStation(station.id, values);
			else await api.createStation(values);
			await invalidateWeather(client, appState);
			open = false;
		} catch {
			error = $t('weather.stationError');
		} finally {
			busy = false;
		}
	}
	async function remove() {
		if (!station || !canEdit || busy) return;
		busy = true;
		error = '';
		try {
			await api.deleteStation(station.id);
			await invalidateWeather(client, appState);
			open = false;
		} catch {
			error = $t('weather.deleteError');
		} finally {
			busy = false;
		}
	}
</script>

<Dialog.Root bind:open
	><Dialog.Content class="sm:max-w-lg"
		><Dialog.Header
			><Dialog.Title
				>{station ? $t('weather.edit') : $t('weather.create')}{station
					? ` · ${station.name}`
					: ''}</Dialog.Title
			><Dialog.Description>{$t('weather.stationHelp')}</Dialog.Description></Dialog.Header
		>
		{#if canEdit}<form onsubmit={save} class="station-form">
				<label class="weather-field"
					>{$t('weather.name')}<input required maxlength="255" bind:value={name} /></label
				>
				<div class="coordinate-fields">
					<label class="weather-field"
						>{$t('weather.latitude')}<input
							type="number"
							required
							min="-90"
							max="90"
							step="any"
							bind:value={latitude}
						/></label
					><label class="weather-field"
						>{$t('weather.longitude')}<input
							type="number"
							required
							min="-180"
							max="180"
							step="any"
							bind:value={longitude}
						/></label
					>
				</div>
				<button
					type="button"
					class="weather-button"
					aria-expanded={mapOpen}
					onclick={() => (mapOpen = !mapOpen)}>{$t('weather.chooseMap')}</button
				>{#if mapOpen}<Map bind:latitude bind:longitude />{/if}
				{#if error}<p role="alert" class="weather-error">{error}</p>{/if}
				<div class="dialog-actions">
					<Dialog.Close class="weather-button" disabled={busy}>{$t('weather.cancel')}</Dialog.Close
					><button type="submit" class="weather-button primary" disabled={busy}
						>{$t(busy ? 'weather.saving' : 'weather.save')}</button
					>
				</div>
				{#if station}<div class="delete-station-area">
						{#if deleting}<p>{$t('weather.confirmStation')}</p>
							<div class="dialog-actions">
								<button
									type="button"
									class="weather-button"
									disabled={busy}
									onclick={() => (deleting = false)}>{$t('weather.cancel')}</button
								><button
									type="button"
									class="weather-button danger"
									disabled={busy}
									onclick={remove}>{$t('weather.removeStation')}</button
								>
							</div>{:else}<button
								type="button"
								class="weather-button danger"
								onclick={() => (deleting = true)}>{$t('weather.removeStation')}</button
							>{/if}
					</div>{/if}
			</form>{/if}
	</Dialog.Content></Dialog.Root
>
