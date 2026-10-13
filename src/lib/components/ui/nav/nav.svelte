<script lang="ts">
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Actions from './actions.svelte';
	import I18n from './i18n.svelte';
	import Links from './links.svelte';
	import ThemeToggle from './themetoggle.svelte';
	import { t } from '@/translations';
	let {
		authForm,
		deleteForm
	}: { authForm: SuperValidated<LoginSchema>; deleteForm: SuperValidated<DeleteSchema> } = $props();
</script>

<header class="weather-header">
	<div class="weather-header-inner">
		<div class="weather-brand">
			<a href="https://miqal.xyz"><span>/</span>miqal</a><span>/</span><a
				href="/"
				aria-label={$t('menu.app.title')}>meteo</a
			>
		</div>
		<Links />
		<div class="weather-header-actions">
			<ThemeToggle /><I18n /><Actions {authForm} {deleteForm} />
		</div>
	</div>
</header>
