<script module>
	type Route = {
		name: string;
		icon: any;
	};

	export { logo, type Route };
</script>

<script lang="ts">
	import { page } from '$app/state';
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { get } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Actions from './actions.svelte';
	import I18n from './i18n.svelte';
	import Links from './links.svelte';
	import StationSelector from './station-selector.svelte';
	import ThemeToggle from './themetoggle.svelte';

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	const isRoot = $derived(page.url.pathname === '/');

	let { authForm, deleteForm }: Props = $props();
</script>

{#snippet logo()}
	<img src="/favicon.png" alt="logo" class="h-8 w-8 rounded-xl" />
	<h1 class="text-accent-foreground hidden text-xl font-bold sm:block">
		{get(t)('menu.app.title')}
	</h1>
{/snippet}

<div
	class={[
		'border-border/40 sticky top-0 z-50 flex w-full justify-center border-b px-4 py-3 backdrop-blur-md sm:px-8',
		{
			'dark:bg-primary-foreground/40 bg-cyan-50/60': isRoot,
			'bg-primary-foreground/60': !isRoot
		}
	]}
>
	<div class="flex w-full max-w-6xl items-center justify-between">
		<StationSelector />
		<Links />
		<div class="hidden items-center gap-x-2 sm:flex">
			<ThemeToggle />
			<I18n />
			<Actions {authForm} {deleteForm} />
		</div>
	</div>
</div>
