import { browser } from '$app/environment';
import type { QueryClient } from '@tanstack/svelte-query';
import type { WeatherApi } from './api';
import type { AppState } from './runes.svelte';
import dayjs from 'dayjs';
import { statsBounds } from './weather';
export function scope(state: AppState) {
	return [
		'weather',
		state.demo ? 'demo' : (state.user?.id ?? state.user?.username ?? 'public')
	] as const;
}
export function stationsOptions(api: WeatherApi, state: AppState, enabled = true) {
	return {
		queryKey: [...scope(state), 'stations'],
		queryFn: () => api.getStations(),
		enabled: browser && enabled,
		staleTime: 60_000,
		retry: 1
	};
}
export function latestOptions(api: WeatherApi, state: AppState) {
	const station = state.stationId;
	return {
		queryKey: [...scope(state), 'latest', station],
		queryFn: () => api.getLatestMeasurement(station),
		enabled: browser && !!state.station && Number.isFinite(station),
		staleTime: 60_000,
		retry: 1
	};
}
export function statsOptions(
	api: WeatherApi,
	state: AppState,
	from: string,
	to: string,
	valid = true
) {
	const station = state.stationId;
	const bounds = statsBounds(from, to);
	return {
		queryKey: [...scope(state), 'stats', station, from, to],
		queryFn: async () =>
			(await api.getMeasurementStats(station, bounds.from, bounds.to)).filter(
				(s) => s.date.format('YYYY-MM-DD') >= from && s.date.format('YYYY-MM-DD') <= to
			),
		enabled: browser && !!state.station && Number.isFinite(station) && valid,
		staleTime: 60_000,
		retry: 1
	};
}
export function forecastOptions(api: WeatherApi, state: AppState) {
	const station = state.stationId;
	return {
		queryKey: [...scope(state), 'forecast', station],
		queryFn: () => api.getForecast(station),
		enabled: browser && !!state.station && Number.isFinite(station),
		staleTime: 300_000,
		retry: 1
	};
}
export function invalidateWeather(client: QueryClient, state: AppState) {
	return client.invalidateQueries({ queryKey: scope(state) });
}

export function dayOptions(api: WeatherApi, state: AppState, date: string | null, enabled = true) {
	const station = state.stationId;
	return {
		queryKey: [...scope(state), 'day', station, date],
		queryFn: () => api.getDayMeasurements(station, dayjs.utc(date!)),
		enabled: browser && !!state.station && Number.isFinite(station) && !!date && enabled,
		staleTime: 60_000,
		retry: 1
	};
}
