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

interface GlobalState {
	stationId: number;
	station?: Station;
	user?: string;
	authOpen: boolean;
}

export const globalState: GlobalState = $state({
	stationId: NaN,
	station: undefined,
	user: undefined,
	authOpen: false
});

export default useLocalStorage;
