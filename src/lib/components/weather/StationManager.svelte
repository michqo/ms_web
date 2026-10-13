<script lang="ts">
	import { t } from '@/translations';
	import { getGlobalState } from '@/shared/runes.svelte';
	import type { Station } from '@/shared/types';
	import * as Dialog from '@/components/ui/dialog';
	import StationDialog from '@/components/station/station-dialog.svelte';
	const appState = getGlobalState();
	let { stations, onSelect }: { stations: Station[]; onSelect: (id: number) => void } = $props();
	let open = $state(false);
	let editorOpen = $state(false);
	let editing = $state<Station | undefined>();
	let search = $state('');
	const visible = $derived(
		stations.filter((s) =>
			`${s.name} ${s.city_name}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())
		)
	);
</script>

<Dialog.Root bind:open
	><Dialog.Trigger class="weather-button">{$t('weather.manage')}</Dialog.Trigger><Dialog.Content
		class="sm:max-w-lg"
		><Dialog.Header
			><Dialog.Title>{$t('weather.stations')}</Dialog.Title><Dialog.Description
				>{appState.demo ? $t('weather.authSample') : $t('weather.stationHelp')}</Dialog.Description
			></Dialog.Header
		>
		{#if stations.length > 5}<label class="weather-field"
				>{$t('weather.station')}<input type="search" bind:value={search} /></label
			>{/if}
		<ul class="station-rows">
			{#each visible as station}<li>
					<button
						class="station-row-select"
						aria-pressed={station.id === appState.stationId}
						onclick={() => {
							onSelect(station.id);
							open = false;
						}}><strong>{station.name}</strong><span>{station.city_name}</span></button
					>{#if !appState.demo && appState.user && station.user === appState.user.id}<button
							class="weather-button"
							onclick={() => {
								editing = station;
								editorOpen = true;
							}}
							aria-label={`${$t('weather.edit')} ${station.name}`}>{$t('weather.edit')}</button
						>{/if}
				</li>{/each}
		</ul>
		{#if !appState.demo && appState.user}<button
				class="weather-button primary"
				onclick={() => {
					editing = undefined;
					editorOpen = true;
				}}>{$t('weather.create')}</button
			>{/if}
	</Dialog.Content></Dialog.Root
>
{#if editorOpen}{#key editing?.id}<StationDialog
			bind:open={editorOpen}
			station={editing}
		/>{/key}{/if}
