/**
 * Svelte runes
 */

import { onMount } from 'svelte';
import type { Station } from './types';

const useLocalStorage = (key: string, initialValue: any) => {
	let value = $state<any>(initialValue);

	onMount(() => {
		const currentValue = localStorage.getItem(key);
		if (currentValue) value = JSON.parse(currentValue);
	});

	const save = () => {
		if (value) {
			localStorage.setItem(key, JSON.stringify(value));
		} else {
			localStorage.removeItem(key);
		}
	};

	return {
		get value() {
			return value;
		},
		set value(v: string) {
			value = v;
			save();
		}
	};
};

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
	isMobile: {
		value: false
	}
});

export { useLocalStorage, useMediaQuery };
