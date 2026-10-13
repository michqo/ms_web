import { getContext, onMount } from 'svelte';
import type { CurrentUser, Station } from './types';
import type { WeatherApi } from './api';

export const APP_CONTEXT = Symbol('weather-app');
export function createAppState(user?: CurrentUser, stationId?: string | null, demo = false) {
	const parsed = Number(stationId);
	const appState = $state({
		stationId: Number.isInteger(parsed) && parsed > 0 ? parsed : NaN,
		station: undefined as Station | undefined,
		user,
		authOpen: false,
		authMode: 'login' as 'login' | 'register',
		userOpen: false,
		demo,
		isMobile: { value: false }
	});
	return appState;
}
export type AppState = ReturnType<typeof createAppState>;
export interface AppContext {
	state: AppState;
	api: WeatherApi;
}
export const getGlobalState = () => getContext<AppContext>(APP_CONTEXT).state;
export const getApi = () => getContext<AppContext>(APP_CONTEXT).api;
export function useMediaQuery(query: string) {
	let matches = $state(false);
	onMount(() => {
		const media = window.matchMedia(query);
		matches = media.matches;
		const update = () => {
			matches = media.matches;
		};
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	});
	return {
		get value() {
			return matches;
		}
	};
}
