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
			id="snow-b"
			x1="22.56"
			x2="39.2"
			y1="21.96"
			y2="50.8"
			gradientUnits="userSpaceOnUse"
			><stop offset="0" stop-color="#f3f7fe" /><stop offset=".45" stop-color="#f3f7fe" /><stop
				offset="1"
				stop-color="#deeafb"
			/></linearGradient
		><linearGradient
			id="snow-a"
			x1="30.12"
			x2="31.88"
			y1="43.48"
			y2="46.52"
			gradientUnits="userSpaceOnUse"
			><stop offset="0" stop-color="#86c3db" /><stop offset=".45" stop-color="#86c3db" /><stop
				offset="1"
				stop-color="#5eafcf"
			/></linearGradient
		><linearGradient
			id="snow-c"
			x1="29.67"
			x2="32.33"
			y1="42.69"
			y2="47.31"
			xlink:href="#snow-a"
		/><linearGradient
			id="snow-d"
			x1="23.12"
			x2="24.88"
			y1="43.48"
			y2="46.52"
			xlink:href="#snow-a"
		/><linearGradient
			id="snow-e"
			x1="22.67"
			x2="25.33"
			y1="42.69"
			y2="47.31"
			xlink:href="#snow-a"
		/><linearGradient
			id="snow-f"
			x1="37.12"
			x2="38.88"
			y1="43.48"
			y2="46.52"
			xlink:href="#snow-a"
		/><linearGradient
			id="snow-g"
			x1="36.67"
			x2="39.33"
			y1="42.69"
			y2="47.31"
			xlink:href="#snow-a"
		/></defs
	><path
		fill="url(#snow-b)"
		stroke="#e6effc"
		stroke-miterlimit="10"
		stroke-width=".5"
		d="M46.5 31.5h-.32a10.49 10.49 0 00-19.11-8 7 7 0 00-10.57 6 7.21 7.21 0 00.1 1.14A7.5 7.5 0 0018 45.5a4.19 4.19 0 00.5 0v0h28a7 7 0 000-14z"
	/><g
		><circle
			cx="31"
			cy="45"
			r="1.25"
			fill="none"
			stroke="url(#snow-a)"
			stroke-miterlimit="10"
		/><path
			fill="none"
			stroke="url(#snow-c)"
			stroke-linecap="round"
			stroke-miterlimit="10"
			d="M33.17 46.25l-1.09-.63m-2.16-1.24l-1.09-.63M31 42.5v1.25m0 3.75v-1.25m-1.08-.63l-1.09.63m4.34-2.5l-1.09.63"
		/><animateTransform
			additive="sum"
			attributeName="transform"
			dur="4s"
			repeatCount="indefinite"
			type="translate"
			values="-1 -6; 1 12"
		/><animateTransform
			additive="sum"
			attributeName="transform"
			dur="9s"
			repeatCount="indefinite"
			type="rotate"
			values="0 31 45; 360 31 45"
		/><animate attributeName="opacity" dur="4s" repeatCount="indefinite" values="0;1;1;1;0" /></g
	><g
		><circle
			cx="24"
			cy="45"
			r="1.25"
			fill="none"
			stroke="url(#snow-d)"
			stroke-miterlimit="10"
		/><path
			fill="none"
			stroke="url(#snow-e)"
			stroke-linecap="round"
			stroke-miterlimit="10"
			d="M26.17 46.25l-1.09-.63m-2.16-1.24l-1.09-.63M24 42.5v1.25m0 3.75v-1.25m-1.08-.63l-1.09.63m4.34-2.5l-1.09.63"
		/><animateTransform
			additive="sum"
			attributeName="transform"
			begin="-2s"
			dur="4s"
			repeatCount="indefinite"
			type="translate"
			values="1 -6; -1 12"
		/><animateTransform
			additive="sum"
			attributeName="transform"
			dur="9s"
			repeatCount="indefinite"
			type="rotate"
			values="0 24 45; 360 24 45"
		/><animate
			attributeName="opacity"
			begin="-2s"
			dur="4s"
			repeatCount="indefinite"
			values="0;1;1;1;0"
		/></g
	><g
		><circle
			cx="38"
			cy="45"
			r="1.25"
			fill="none"
			stroke="url(#snow-f)"
			stroke-miterlimit="10"
		/><path
			fill="none"
			stroke="url(#snow-g)"
			stroke-linecap="round"
			stroke-miterlimit="10"
			d="M40.17 46.25l-1.09-.63m-2.16-1.24l-1.09-.63M38 42.5v1.25m0 3.75v-1.25m-1.08-.63l-1.09.63m4.34-2.5l-1.09.63"
		/><animateTransform
			additive="sum"
			attributeName="transform"
			begin="-1s"
			dur="4s"
			repeatCount="indefinite"
			type="translate"
			values="1 -6; -1 12"
		/><animateTransform
			additive="sum"
			attributeName="transform"
			dur="9s"
			repeatCount="indefinite"
			type="rotate"
			values="0 38 45; 360 38 45"
		/><animate
			attributeName="opacity"
			begin="-1s"
			dur="4s"
			repeatCount="indefinite"
			values="0;1;1;1;0"
		/></g
	></svg
>
