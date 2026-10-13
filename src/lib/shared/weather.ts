import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import type { Forecast, Measurement, MeasurementStat } from './types';

function numeric(value: unknown): number {
	if (
		(typeof value !== 'number' && typeof value !== 'string') ||
		(typeof value === 'string' && !value.trim())
	)
		throw new Error('Missing reading');
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) throw new Error('Invalid reading');
	return parsed;
}
function optionalNumber(value: unknown): number | null {
	return value == null || value === '' ? null : numeric(value);
}
export function normalizeMeasurement(value: unknown): Measurement {
	const data = value as Record<string, unknown>;
	if (!data || typeof data !== 'object' || typeof data.timestamp !== 'string')
		throw new Error('Invalid measurement');
	const timestamp = dayjs(data.timestamp as string);
	if (!timestamp.isValid()) throw new Error('Invalid timestamp');
	return {
		id: data.id == null ? undefined : numeric(data.id),
		timestamp,
		temperature: numeric(data.temperature),
		humidity: numeric(data.humidity),
		pressure: optionalNumber(data.pressure),
		rain: optionalNumber(data.rain),
		wind_speed: optionalNumber(data.wind_speed),
		wind_direction: optionalNumber(data.wind_direction),
		created_at: String(data.created_at ?? timestamp.toISOString())
	};
}
export function normalizeStats(value: unknown): MeasurementStat[] {
	if (!Array.isArray(value)) throw new Error('Invalid daily statistics');
	return value
		.map((item) => {
			if (typeof item.date !== 'string' || !validDate(item.date.slice(0, 10)))
				throw new Error('Invalid statistics date');
			const date = dayjs.utc(item.date);
			if (!date.isValid()) throw new Error('Invalid statistics date');
			return {
				date,
				station: numeric(item.station),
				temperature: numeric(item.temperature),
				humidity: numeric(item.humidity)
			};
		})
		.sort((a, b) => a.date.valueOf() - b.date.valueOf());
}
export type RangePreset = '1d' | '7d' | '30d' | 'custom';
export type Metric = 'temperature' | 'humidity';
export function validDate(value: string | null): value is string {
	return (
		!!value &&
		/^\d{4}-\d{2}-\d{2}$/.test(value) &&
		dayjs(value).isValid() &&
		dayjs(value).format('YYYY-MM-DD') === value
	);
}
export function readSelection(params: URLSearchParams, today = dayjs.utc()) {
	const preset = params.get('range');
	const range: RangePreset = ['1d', '7d', '30d', 'custom'].includes(preset ?? '')
		? (preset as RangePreset)
		: '7d';
	const end = today.format('YYYY-MM-DD');
	const defaultFrom = today
		.subtract(range === '30d' ? 29 : range === '1d' ? 0 : 6, 'day')
		.format('YYYY-MM-DD');
	const from =
		range === 'custom' && validDate(params.get('from')) ? params.get('from')! : defaultFrom;
	const to = range === 'custom' && validDate(params.get('to')) ? params.get('to')! : end;
	const error =
		(range === 'custom' && (!validDate(params.get('from')) || !validDate(params.get('to')))) ||
		from > to ||
		to > end ||
		dayjs(to).diff(dayjs(from), 'day') > 365;
	return {
		range,
		from,
		to,
		error,
		metric: (params.get('metric') === 'humidity' ? 'humidity' : 'temperature') as Metric,
		day:
			validDate(params.get('day')) && params.get('day')! >= from && params.get('day')! <= to
				? params.get('day')!
				: null
	};
}
export function statsBounds(from: string, to: string) {
	return { from, to };
}
export function measurementAge(timestamp: dayjs.Dayjs, now: number) {
	return Math.max(0, Math.floor((now - timestamp.valueOf()) / 60_000));
}
export function formatReading(value: number | null | undefined, locale = 'en', decimals = 1) {
	return value == null || !Number.isFinite(value)
		? '—'
		: new Intl.NumberFormat(locale, { maximumFractionDigits: decimals }).format(value);
}
export function windDirection(degrees: number | null) {
	return degrees == null
		? '—'
		: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][
				Math.round((((degrees % 360) + 360) % 360) / 45) % 8
			];
}
export function dailyCsv(stats: MeasurementStat[]) {
	return [
		'date,temperature_daily_mean_c,humidity_daily_mean_percent',
		...stats.map((s) => `${s.date.format('YYYY-MM-DD')},${s.temperature},${s.humidity}`)
	].join('\r\n');
}

export function normalizeForecast(value: unknown): Forecast {
	const data = value as Forecast;
	if (!data || !Array.isArray(data.time) || !data.time.every((d) => validDate(d)))
		throw new Error('Invalid forecast dates');
	const fields = [
		'temperature_mean',
		'temperature_instant',
		'temperature_max',
		'temperature_min',
		'relativehumidity_mean',
		'windspeed_mean',
		'sealevelpressure_mean',
		'precipitation',
		'precipitation_hours',
		'predictability',
		'pictocode',
		'winddirection',
		'uvindex'
	] as const;
	for (const field of fields)
		if (
			!Array.isArray(data[field]) ||
			data[field].length !== data.time.length ||
			!data[field].every((v) => Number.isFinite(v))
		)
			throw new Error('Incomplete forecast');
	if (!dayjs(data.modelrun_utc).isValid() || !dayjs(data.created_at).isValid())
		throw new Error('Invalid forecast metadata');
	return data;
}
