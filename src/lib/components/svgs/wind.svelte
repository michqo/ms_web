<script lang="ts">
	const { width = 32, height = 32 } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	{width}
	{height}
	viewBox="0 0 64 64"
	><defs
		><linearGradient
			id="wind_a"
			x1="27.56"
			x2="38.27"
			y1="17.64"
			y2="36.19"
			gradientUnits="userSpaceOnUse"
			><stop offset="0" stop-color="#d4d7dd" /><stop offset=".45" stop-color="#d4d7dd" /><stop
				offset="1"
				stop-color="#bec1c6"
			/></linearGradient
		><linearGradient
			id="wind_b"
			x1="19.96"
			x2="31.37"
			y1="29.03"
			y2="48.8"
			xlink:href="#wind_a"
		/></defs
	><path
		fill="none"
		stroke="url(#wind_a)"
		stroke-dasharray="35 22"
		stroke-linecap="round"
		stroke-miterlimit="10"
		stroke-width="3"
		d="M43.64 20a5 5 0 113.61 8.46h-35.5"
		><animate
			attributeName="stroke-dashoffset"
			dur="2s"
			repeatCount="indefinite"
			values="-57; 57"
		/></path
	><path
		fill="none"
		stroke="url(#wind_b)"
		stroke-dasharray="24 15"
		stroke-linecap="round"
		stroke-miterlimit="10"
		stroke-width="3"
		d="M29.14 44a5 5 0 103.61-8.46h-21"
		><animate
			attributeName="stroke-dashoffset"
			begin="-1.5s"
			dur="2s"
			repeatCount="indefinite"
			values="-39; 39"
		/></path
	></svg
>
