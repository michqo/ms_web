<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { cn } from '@/utils.js';
	import type { Map as LeafletMap, Marker, TileLayer, LeafletMouseEvent } from 'leaflet';

	let mapElement: HTMLDivElement;
	let map = $state<LeafletMap | null>(null);
	let marker = $state<Marker | null>(null);

	interface Props {
		latitude: number;
		longitude: number;
		zoom?: number;
		class?: string;
	}

	let {
		latitude = $bindable(),
		longitude = $bindable(),
		zoom = 8,
		class: className = ''
	}: Props = $props();

	onMount(async () => {
		if (!browser) return;

		// Dynamically import Leaflet
		const L = await import('leaflet');

		// Create map
		map = L.map(mapElement).setView([latitude, longitude], zoom);

		// Add tile layer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		// Add marker at initial position
		marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

		// Update coordinates when marker is dragged
		marker.on('dragend', updateCoordinates);

		// Update coordinates when map is clicked
		map.on('click', (e: LeafletMouseEvent) => {
			if (!marker) return;
			marker.setLatLng(e.latlng);
			updateCoordinates();
		});
	});

	function updateCoordinates(): void {
		if (!marker) return;
		const latlng = marker.getLatLng();
		latitude = latlng.lat;
		longitude = latlng.lng;
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

<div bind:this={mapElement} class={cn('h-[300px] w-full rounded-md border', className)}></div>
<div class="mt-2 text-xs text-muted-foreground">
	Current coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
</div>
