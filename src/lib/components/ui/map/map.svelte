<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { cn } from '@/utils.js';
	import type { Map as LeafletMap, Marker, TileLayer, LeafletMouseEvent } from 'leaflet';
	import { Button } from '../button';
	import { t } from '@/translations';
	import type { ClassValue } from 'svelte/elements';
	import type { Station } from '@/shared/types';

	let mapElement: HTMLDivElement;
	let map = $state<LeafletMap | null>(null);
	let marker = $state<Marker | null>(null);
	let locating = $state(false);
	let locationError = $state<string | null>(null);

	interface Props {
		latitude?: number;
		longitude?: number;
		stations?: Station[];
		zoom?: number;
		class?: ClassValue;
		preview?: boolean;
	}

	let {
		latitude = $bindable(0),
		longitude = $bindable(0),
		stations,
		zoom,
		class: className,
		preview = false
	}: Props = $props();

	onMount(async () => {
		if (!browser) return;

		// Dynamically import Leaflet
		const L = await import('leaflet');

		// Create map with controls disabled in preview mode
		zoom = stations ? 7 : zoom ? zoom : 8;
		const controlAllow = !preview || !!stations;
		map = L.map(mapElement, {
			zoomControl: controlAllow,
			dragging: controlAllow,
			scrollWheelZoom: controlAllow,
			doubleClickZoom: controlAllow,
			touchZoom: controlAllow
		}).setView([latitude, longitude], zoom);

		// Add tile layer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: preview
				? ''
				: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		if (stations && stations.length > 0) {
			const markers = stations.map((i) =>
				L.marker([i.latitude, i.longitude]).bindTooltip(i.name, {
					permanent: true,
					direction: 'top',
					className: 'ms-marker-tooltip',
					offset: [0, -10]
				})
			);
			const featureGroup = L.featureGroup(markers).addTo(map);
			map.fitBounds(featureGroup.getBounds(), { padding: [50, 50] });
		}

		if (!stations) {
			// Add marker at initial position
			marker = L.marker([latitude, longitude], {
				draggable: !preview
			}).addTo(map);

			// Only add event listeners if not in preview mode
			if (!preview) {
				// Update coordinates when marker is dragged
				marker.on('dragend', updateCoordinates);

				// Update coordinates when map is clicked
				map.on('click', (e: LeafletMouseEvent) => {
					if (!marker) return;
					marker.setLatLng(e.latlng);
					updateCoordinates();
				});
			}
		}
	});

	function updateCoordinates(): void {
		if (!marker) return;
		const latlng = marker.getLatLng();
		latitude = latlng.lat;
		longitude = latlng.lng;
	}

	function getCurrentLocation(): void {
		if (!browser || !navigator.geolocation) {
			locationError = $t('dash.dialog.map.notSupported');
			return;
		}

		locating = true;
		locationError = null;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;

				if (map && marker) {
					marker.setLatLng([latitude, longitude]);
					map.setView([latitude, longitude], 14); // Closer zoom level (14) when locating user
				}
				locating = false;
			},
			(error) => {
				console.error('Error getting location:', error);
				locationError = `${$t('dash.map.error')}: ${error.message}`;
				locating = false;
			},
			{
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0
			}
		);
	}

	$effect(() => {
		if (!map || !marker) return;

		const currentLatLng = marker.getLatLng();
		if (latitude !== currentLatLng.lat || longitude !== currentLatLng.lng) {
			marker.setLatLng([latitude, longitude]);
			map.setView([latitude, longitude], map.getZoom());
		}
	});

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<svelte:head>
	{#if browser}
		<link
			rel="stylesheet"
			href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
			integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
			crossorigin=""
		/>
	{/if}
</svelte:head>

<div class="ms-map-container">
	<div bind:this={mapElement} class={cn('h-[300px] w-full rounded-md border', className)}></div>

	{#if !preview}
		<div class="mt-2 flex items-center justify-between">
			<div class="text-muted-foreground text-xs">
				{$t('dash.map.currentCoords')}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
			</div>

			<Button
				variant="outline"
				size="sm"
				onclick={getCurrentLocation}
				disabled={locating}
				class="flex items-center gap-1"
			>
				{#if locating}
					<svg
						class="text-muted-foreground h-3 w-3 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="text-muted-foreground h-3 w-3"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
				<span class="text-xs"
					>{locating ? $t('dash.map.locating') : $t('dash.map.retrieve_location')}</span
				>
			</Button>
		</div>

		{#if locationError}
			<div class="mt-1 text-xs text-red-500">{locationError}</div>
		{/if}
	{/if}
</div>

<style>
	/* Fix z-index issues for map panes */
	:global(.ms-map-container .leaflet-pane) {
		z-index: 40 !important;
	}
	:global(.ms-map-container .leaflet-top),
	:global(.ms-map-container .leaflet-bottom) {
		z-index: 45 !important;
	}
	:global(.ms-map-container .leaflet-control) {
		z-index: 49 !important;
	}
	:global(.leaflet-control-attribution) {
		display: none !important;
	}

	/* Shadcn style for markers */
	:global(.ms-marker-tooltip) {
		background-color: var(--card) !important;
		color: var(--card-foreground) !important;
		border: 1px solid var(--border) !important;
		border-radius: var(--radius) !important;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
		font-weight: 500 !important;
		padding: 2px 8px !important;
		font-size: 0.75rem !important;
	}

	:global(.ms-marker-tooltip::before) {
		border-top-color: var(--border) !important;
	}
</style>
