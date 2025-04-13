<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { cn } from '@/utils.js';
	import type { Map as LeafletMap, Marker, TileLayer, LeafletMouseEvent } from 'leaflet';
	import { Button } from '../button';
	import { t } from '@/translations';

	let mapElement: HTMLDivElement;
	let map = $state<LeafletMap | null>(null);
	let marker = $state<Marker | null>(null);
	let locating = $state(false);
	let locationError = $state<string | null>(null);

	interface Props {
		latitude: number;
		longitude: number;
		zoom?: number;
		class?: string;
		preview?: boolean;
	}

	let {
		latitude = $bindable(),
		longitude = $bindable(),
		zoom = 8,
		class: className = '',
		preview = false
	}: Props = $props();

	onMount(async () => {
		if (!browser) return;

		// Dynamically import Leaflet
		const L = await import('leaflet');

		// Create map with controls disabled in preview mode
		map = L.map(mapElement, {
			zoomControl: !preview,
			dragging: !preview,
			scrollWheelZoom: !preview,
			doubleClickZoom: !preview,
			touchZoom: !preview
		}).setView([latitude, longitude], zoom);

		// Add tile layer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: preview ? '' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

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
	});

	function updateCoordinates(): void {
		if (!marker) return;
		const latlng = marker.getLatLng();
		latitude = latlng.lat;
		longitude = latlng.lng;
	}

	function getCurrentLocation(): void {
		if (!browser || !navigator.geolocation) {
			locationError = $t('home.dialog.map.notSupported');
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
				locationError = `${$t('home.map.error')}: ${error.message}`;
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
			<div class="text-xs text-muted-foreground">
				{$t('home.map.currentCoords')}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
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
						class="h-3 w-3 animate-spin text-muted-foreground"
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
						class="h-3 w-3 text-muted-foreground"
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
				<span class="text-xs">{locating ? $t('home.map.locating') : $t('home.map.retrieve_location')}</span>
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
</style>
