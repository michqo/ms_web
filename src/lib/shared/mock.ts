import utc from 'dayjs/plugin/utc';
import dayjs, { type Dayjs } from 'dayjs';
import type { Forecast, ListResponse, MeasurementDTO, MeasurementStatDTO, Station } from './types';

dayjs.extend(utc);
const stations: Station[] = [
	{
		id: 1,
		user: 0,
		name: 'Bratislava',
		city_name: 'Bratislava',
		latitude: 48.1486,
		longitude: 17.1077,
		created_at: '2026-01-01T00:00:00Z'
	},
	{
		id: 2,
		user: 0,
		name: 'Košice',
		city_name: 'Košice',
		latitude: 48.7164,
		longitude: 21.2611,
		created_at: '2026-01-01T00:00:00Z'
	}
];
function reading(date: Dayjs, station: number): MeasurementDTO {
	const hour = date.hour() + date.minute() / 60;
	const offset = date.startOf('day').diff(dayjs.utc('2026-01-01'), 'day');
	return {
		id: date.valueOf() * 10 + station,
		timestamp: date.toISOString(),
		created_at: date.toISOString(),
		temperature: Number(
			(
				19 +
				station +
				Math.sin(offset * 0.9) * 2.4 +
				Math.sin(((hour - 7) * Math.PI) / 12) * 5
			).toFixed(1)
		),
		humidity: Math.round(
			62 + Math.cos(offset * 0.7) * 9 - Math.sin(((hour - 7) * Math.PI) / 12) * 12
		),
		pressure: null,
		wind_speed: null,
		wind_direction: null,
		rain: null
	};
}
export function mockGetStations(): ListResponse<Station> {
	return {
		count: stations.length,
		next: null,
		previous: null,
		results: stations.map((s) => ({ ...s }))
	};
}
export function mockGetLatestMeasurement(station: number) {
	return reading(dayjs.utc().startOf('day').hour(12), station);
}
export function mockGetMeasurements(
	station: number,
	page: number,
	date: Dayjs,
	pageSize = 10
): ListResponse<MeasurementDTO> {
	if (date.isBefore(dayjs.utc().subtract(29, 'day').startOf('day')))
		return { count: 0, next: null, previous: null, results: [] };
	const total = 48;
	const results = Array.from({ length: total }, (_, i) =>
		reading(date.startOf('day').add((47 - i) * 30, 'minute'), station)
	);
	return {
		count: total,
		next: page * pageSize < total ? '?page=' + (page + 1) : null,
		previous: page > 1 ? '?page=' + (page - 1) : null,
		results: results.slice((page - 1) * pageSize, page * pageSize)
	};
}
export function mockGetMeasurementStats(
	station: number,
	gt: string,
	lt: string
): MeasurementStatDTO[] {
	const results: MeasurementStatDTO[] = [];
	let date = dayjs.utc(gt).startOf('day');
	const end = dayjs.utc(lt);
	while (!date.isAfter(end) && results.length < 366) {
		if (date.isBefore(dayjs.utc().subtract(29, 'day').startOf('day'))) {
			date = date.add(1, 'day');
			continue;
		}
		const offset = date.diff(dayjs.utc('2026-01-01'), 'day');
		results.push({
			station,
			date: date.format('YYYY-MM-DD'),
			temperature: Number((19 + station + Math.sin(offset * 0.9) * 2.4).toFixed(1)),
			humidity: Math.round(62 + Math.cos(offset * 0.7) * 9)
		});
		date = date.add(1, 'day');
	}
	return results;
}
export function mockGetForecast(stationId: number): Forecast {
	const station = stations.find((s) => s.id === stationId) ?? stations[0];
	const today = dayjs.utc().startOf('day');
	return {
		id: stationId,
		latitude: station.latitude,
		longitude: station.longitude,
		city_name: station.city_name,
		modelrun_utc: today.hour(6).toISOString(),
		utc_timeoffset: 2,
		generation_time_ms: 0,
		created_at: today.hour(7).toISOString(),
		time: Array.from({ length: 7 }, (_, i) => today.add(i, 'day').format('YYYY-MM-DD')),
		temperature_max: [25, 24, 22, 21, 23, 24, 25],
		temperature_min: [14, 13, 12, 11, 12, 13, 14],
		temperature_mean: [20, 19, 17, 16, 18, 19, 20],
		temperature_instant: [22, 21, 19, 18, 20, 21, 22],
		relativehumidity_mean: [61, 65, 72, 75, 66, 62, 60],
		windspeed_mean: [3.2, 4, 5.1, 3, 2.5, 3.8, 3],
		sealevelpressure_mean: [1013, 1012, 1009, 1010, 1014, 1015, 1013],
		precipitation: [0, 0, 2.4, 1.2, 0, 0, 0],
		precipitation_hours: [0, 0, 3, 2, 0, 0, 0],
		predictability: [90, 85, 80, 75, 70, 65, 60],
		pictocode: [1, 3, 7, 7, 3, 1, 1],
		winddirection: [180, 200, 220, 180, 160, 180, 200],
		uvindex: [4, 4, 2, 2, 3, 4, 4]
	};
}
