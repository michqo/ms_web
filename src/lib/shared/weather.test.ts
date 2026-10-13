import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
	dailyCsv,
	formatReading,
	measurementAge,
	normalizeForecast,
	normalizeMeasurement,
	normalizeStats,
	readSelection,
	statsBounds,
	validDate
} from './weather';
import { mockGetForecast } from './mock';

describe('weather wire contracts', () => {
	it('parses JSON timestamps and decimal readings without inventing missing sensors', () => {
		const reading = normalizeMeasurement({
			timestamp: '2026-10-11T10:00:00Z',
			temperature: '24.1',
			humidity: 65
		});
		expect(reading.timestamp.toISOString()).toBe('2026-10-11T10:00:00.000Z');
		expect(reading.temperature).toBe(24.1);
		expect(reading.pressure).toBeNull();
		expect(reading.wind_speed).toBeNull();
		expect(reading.rain).toBeNull();
	});
	it.each([null, '', undefined, NaN, Infinity])(
		'rejects a missing or invalid temperature %s',
		(value) =>
			expect(() =>
				normalizeMeasurement({ timestamp: '2026-10-11', temperature: value, humidity: 65 })
			).toThrow()
	);
	it('keeps empty statistics empty and orders valid UTC dates', () => {
		expect(normalizeStats([])).toEqual([]);
		expect(
			normalizeStats([
				{ date: '2026-10-10T00:00:00Z', station: 1, temperature: 2, humidity: 3 },
				{ date: '2026-10-09T00:00:00Z', station: 1, temperature: 1, humidity: 2 }
			]).map((d) => d.date.format('YYYY-MM-DD'))
		).toEqual(['2026-10-09', '2026-10-10']);
	});
	it('rejects mismatched forecast arrays before displaying a partial forecast', () => {
		const data = mockGetForecast(1);
		expect(normalizeForecast(data).time).toHaveLength(7);
		expect(() => normalizeForecast({ ...data, temperature_max: [25] })).toThrow();
	});
});
describe('UTC selections and exports', () => {
	const today = dayjs.utc('2026-10-11T10:30:00Z');
	it('uses seven inclusive calendar days, including across a DST weekend', () => {
		expect(readSelection(new URLSearchParams(), today)).toMatchObject({
			from: '2026-10-05',
			to: '2026-10-11',
			range: '7d'
		});
		expect(statsBounds('2026-03-26', '2026-04-01')).toEqual({
			from: '2026-03-26',
			to: '2026-04-01'
		});
	});
	it.each([
		'range=custom&from=2026-02-30&to=2026-10-11',
		'range=custom&from=2026-10-11&to=2026-10-10',
		'range=custom&from=2026-10-10&to=2026-10-12',
		'range=custom',
		'range=custom&from=2025-01-01&to=2026-10-11'
	])('rejects invalid or excessive custom dates %s', (params) =>
		expect(readSelection(new URLSearchParams(params), today).error).toBe(true)
	);
	it('ignores a selected day outside the selected range', () =>
		expect(readSelection(new URLSearchParams('day=2026-01-01'), today).day).toBeNull());
	it('exports daily averages with explicit units and UTC date scope', () => {
		const rows = normalizeStats([
			{ date: '2026-10-11', temperature: 20.1, humidity: 62, station: 1 }
		]);
		expect(dailyCsv(rows)).toBe(
			'date,temperature_daily_mean_c,humidity_daily_mean_percent\r\n2026-10-11,20.1,62'
		);
	});
	it('updates the reading age independently of a data refetch', () => {
		const timestamp = dayjs('2026-10-11T10:00:00Z');
		expect(measurementAge(timestamp, timestamp.valueOf() + 180000)).toBe(3);
		expect(measurementAge(timestamp, timestamp.valueOf() + 240000)).toBe(4);
	});
	it('formats missing readings as unavailable instead of zero', () => {
		expect(formatReading(null)).toBe('—');
		expect(formatReading(0)).toBe('0');
		expect(validDate('2026-02-30')).toBe(false);
	});
});
