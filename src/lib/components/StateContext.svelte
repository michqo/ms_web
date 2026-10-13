<script lang="ts">
	import { setContext, untrack, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { toStore } from 'svelte/store';
	import Cookies from 'js-cookie';
	import dayjs from 'dayjs';
	import { createApiClient } from '@/shared/api';
	import { APP_CONTEXT, createAppState, useMediaQuery } from '@/shared/runes.svelte';
	import { stationsOptions } from '@/shared/queries';
	import type { CurrentUser } from '@/shared/types';
	let {
		children,
		locale,
		user,
		accessToken = '',
		defaultStationId,
		demo = false
	}: {
		children: Snippet;
		locale: string;
		user?: CurrentUser;
		accessToken?: string;
		defaultStationId?: string | null;
		demo?: boolean;
	} = $props();
	const appState = untrack(() => createAppState(user, demo ? '1' : defaultStationId, demo));
	const api = untrack(() => createApiClient(accessToken, () => appState.demo));
	const client = useQueryClient();
	setContext(APP_CONTEXT, { state: appState, api });
	const mobile = useMediaQuery('(max-width: 640px)');
	let session = untrack(() => accessToken);
	let mode = untrack(() => demo);
	const stations = createQuery(
		toStore(() => stationsOptions(api, appState, page.url.pathname !== '/'))
	);
	$effect(() => {
		if (session !== accessToken || mode !== demo) {
			client.clear();
			appState.stationId = demo ? 1 : Number(defaultStationId) || NaN;
			appState.station = undefined;
			appState.authOpen = false;
			appState.userOpen = false;
		}
		session = accessToken;
		mode = demo;
		appState.demo = demo;
		appState.user = user;
		api.setAuthToken(demo ? '' : accessToken);
	});
	$effect(() => {
		appState.isMobile.value = mobile.value;
	});
	$effect(() => {
		dayjs.locale(locale);
		if (browser) document.documentElement.lang = locale;
	});
	$effect(() => {
		const values = $stations.data?.results;
		if (!values) return;
		const requested = Number(page.url.searchParams.get('station'));
		const selected =
			values.find((s) => s.id === requested) ??
			values.find((s) => s.id === appState.stationId) ??
			values[0];
		appState.station = selected;
		appState.stationId = selected?.id ?? NaN;
		if (!appState.demo && browser) {
			if (selected)
				Cookies.set('defaultStationId', String(selected.id), { expires: 365, path: '/' });
			else Cookies.remove('defaultStationId', { path: '/' });
		}
	});
</script>

{@render children()}
