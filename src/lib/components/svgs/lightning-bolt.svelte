<script lang="ts">
	const { width = 32, height = 32 } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" {width} {height} viewBox="0 0 64 64"
	><defs
		><linearGradient
			id="lightning-bolt-a"
			x1="24.11"
			x2="37.64"
			y1="18.33"
			y2="41.78"
			gradientUnits="userSpaceOnUse"
			><stop offset="0" stop-color="#f7b23b" /><stop offset=".45" stop-color="#f7b23b" /><stop
				offset="1"
				stop-color="#f59e0b"
			/></linearGradient
		></defs
	><path
		fill="url(#lightning-bolt-a)"
		stroke="#f6a823"
		stroke-miterlimit="10"
		stroke-width=".5"
		d="M29 15.5l-6 18h6l-3 15 15-21h-9l6-12h-9z"
		><animate
			attributeName="opacity"
			dur="2s"
			repeatCount="indefinite"
			values="1; 1; 1; 1; 1; 1; 0.1; 1; 0.1; 1; 1; 0.1; 1; 0.1; 1"
		/></path
	></svg
>
