<script module>
	type Route = {
		name: string;
		icon: any;
	};

	export { type Route };
</script>

<script lang="ts">
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { get } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Actions from './actions.svelte';
	import Loading from '@/components/Loading.svelte';
	import I18n from './i18n.svelte';
	import Links from './links.svelte';
	import StationSelector from './station-selector.svelte';
	import ThemeToggle from './themetoggle.svelte';

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	let { authForm, deleteForm }: Props = $props();
</script>

<header class="bg-background/90 border-border sticky top-0 z-50 border-b backdrop-blur-md">
	<div
		class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto]"
	>
		<div class="flex min-w-0 items-center font-mono text-sm font-semibold tracking-tight">
			<a
				href="https://miqal.xyz"
				class="hover:text-primary inline-flex min-h-11 items-center rounded-sm"
				><span class="text-primary">/</span>miqal</a
			>
			<span class="text-muted-foreground px-1.5">/</span>
			<a
				href="/"
				aria-label={get(t)('menu.app.title')}
				class="hover:text-primary inline-flex min-h-11 items-center rounded-sm">meteo</a
			>
		</div>
		<div
			class="col-span-2 row-start-2 flex min-w-0 flex-wrap items-center justify-between gap-2 md:col-span-1 md:col-start-2 md:row-start-1 md:justify-center"
		>
			<StationSelector />
			<Links />
		</div>
		<div class="col-start-2 row-start-1 flex items-center gap-1 md:col-start-3">
			<ThemeToggle />
			<I18n />
			<div class="hidden sm:block"><Actions {authForm} {deleteForm} /></div>
		</div>
	</div>
	<Loading />
</header>
