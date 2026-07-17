/**
 * Svelte runes
 */

import { onMount } from 'svelte';
import type { Station } from './types';
import { isMockMode, persistMockMode } from './mock-mode';

const useMediaQuery = (query: string) => {
	let matches = $state(false);

	onMount(() => {
		const mediaQueryList = window.matchMedia(query);
		matches = mediaQueryList.matches;

		const listener = (event: MediaQueryListEvent) => {
			matches = event.matches;
		};

		mediaQueryList.addEventListener('change', listener);

		return () => {
			mediaQueryList.removeEventListener('change', listener);
		};
	});

	return {
		get value() {
			return matches;
		}
	};
};

interface GlobalState {
	stationId: number;
	station?: Station;
	user?: string;
	authOpen: boolean;
	userOpen: boolean;
	mockMode: boolean;
	isMobile: {
		readonly value: boolean;
	};
}

export const globalState: GlobalState = $state({
	stationId: NaN,
	station: undefined,
	user: undefined,
	authOpen: false,
	userOpen: false,
	mockMode: typeof localStorage !== 'undefined' ? isMockMode() : false,
	isMobile: {
		value: false
	}
});

export function setMockMode(enabled: boolean) {
	globalState.mockMode = enabled;
	persistMockMode(enabled);
}

export { useMediaQuery };
