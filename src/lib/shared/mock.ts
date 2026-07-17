import type {
	Forecast,
	ForecastBase,
	ListResponse,
	Measurement,
	MeasurementStat,
	Station
} from './types';
import type { LoginSchema } from './schemas';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const MOCK_TOKEN = 'mock_access_token_xxx';
const MOCK_REFRESH = 'mock_refresh_token_xxx';

let stationIdCounter = 100;

const stations: Station[] = [
	{
		id: 1,
		user: 1,
		name: 'Bratislava',
		city_name: 'Bratislava',
		latitude: 48.1486,
		longitude: 17.1077,
		created_at: '2024-01-15T08:00:00Z'
	},
	{
		id: 2,
		user: 1,
		name: 'Košice',
		city_name: 'Košice',
		latitude: 48.7164,
		longitude: 21.2611,
		created_at: '2024-02-20T10:30:00Z'
	},
	{
		id: 3,
		user: 1,
		name: 'Žilina',
		city_name: 'Žilina',
		latitude: 49.2235,
		longitude: 18.7394,
		created_at: '2024-03-10T14:15:00Z'
	}
];

function randomBetween(min: number, max: number, decimals = 1): number {
	const val = Math.random() * (max - min) + min;
	return parseFloat(val.toFixed(decimals));
}

function generateMeasurement(date: Dayjs): Measurement {
	return {
		timestamp: date,
		temperature: randomBetween(15, 30),
		humidity: randomBetween(40, 85, 0),
		pressure: randomBetween(1005, 1025, 0),
		rain: randomBetween(0, 5),
		wind_speed: randomBetween(0, 20),
		wind_direction: randomBetween(0, 360, 0),
		created_at: date.toISOString()
	};
}

export function delay(ms = 300): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

export function mockAuthLogin(_credentials: LoginSchema) {
	return { access: MOCK_TOKEN, refresh: MOCK_REFRESH };
}

export function mockAuthRegister() {}

export function mockAuthGetUser(): string {
	return 'demo_user';
}

export function mockGetStations(): ListResponse<Station> {
	return { count: stations.length, next: null, previous: null, results: [...stations] };
}

export function mockGetLatestMeasurement(stationId: number): Measurement {
	const now = dayjs();
	return generateMeasurement(now.subtract(randomBetween(1, 15, 0), 'minute'));
}

export function mockGetMeasurements(
	station: number,
	page: number,
	date: Dayjs,
	pageSize: number
): ListResponse<Measurement> {
	const totalCount = 48;
	const startIdx = (page - 1) * pageSize;
	const results: Measurement[] = [];

	for (let i = 0; i < pageSize && startIdx + i < totalCount; i++) {
		const hour = date.hour(23 - Math.floor((startIdx + i) / 2)).minute((i % 2) * 30);
		results.push(generateMeasurement(hour));
	}

	return {
		count: totalCount,
		next: startIdx + pageSize < totalCount ? `?page=${page + 1}` : null,
		previous: page > 1 ? `?page=${page - 1}` : null,
		results
	};
}

export function mockGetMeasurementStats(
	station: number,
	gt: string,
	lt: string
): MeasurementStat[] {
	const from = dayjs(gt);
	const to = dayjs(lt);
	const results: MeasurementStat[] = [];
	let current = from.startOf('day');

	while (current.isBefore(to) || current.isSame(to, 'day')) {
		results.push({
			temperature: randomBetween(18, 28),
			humidity: randomBetween(45, 80, 0),
			station,
			date: current
		});
		current = current.add(1, 'day');
	}

	return results;
}

export function mockGetForecast(stationId: number): Forecast {
	const now = dayjs();
	const station = stations.find((s) => s.id === stationId) ?? stations[0];
	const days = 7;

	const arrays: Record<string, any[]> = {
		time: [],
		temperature_mean: [],
		temperature_instant: [],
		temperature_max: [],
		temperature_min: [],
		relativehumidity_mean: [],
		windspeed_mean: [],
		sealevelpressure_mean: [],
		precipitation: [],
		precipitation_hours: [],
		predictability: [],
		pictocode: [],
		winddirection: [],
		uvindex: []
	};

	for (let i = 0; i < days; i++) {
		const ts = now.valueOf() + i * 86400 * 1000;
		arrays.time.push(new Date(ts).toISOString());
		arrays.temperature_instant.push(randomBetween(16, 28));
		arrays.temperature_max.push(randomBetween(22, 32));
		arrays.temperature_min.push(randomBetween(12, 20));
		arrays.temperature_mean.push(randomBetween(18, 26));
		arrays.relativehumidity_mean.push(randomBetween(45, 85, 0));
		arrays.windspeed_mean.push(randomBetween(2, 15));
		arrays.sealevelpressure_mean.push(randomBetween(1005, 1025, 0));
		arrays.precipitation.push(randomBetween(0, 3));
		arrays.precipitation_hours.push(randomBetween(0, 1, 0));
		arrays.predictability.push(randomBetween(70, 100, 0));
		arrays.pictocode.push(Math.floor(randomBetween(1, 5, 0)));
		arrays.winddirection.push(randomBetween(0, 360, 0));
		arrays.uvindex.push(randomBetween(1, 8, 0));
	}

	return {
		id: station.id,
		latitude: station.latitude,
		longitude: station.longitude,
		city_name: station.city_name,
		modelrun_utc: now.toISOString(),
		utc_timeoffset: 2,
		generation_time_ms: 245,
		created_at: now.toISOString(),
		...arrays
	} as Forecast;
}

export function mockCreateStation(data: Partial<Station>): Station {
	stationIdCounter++;
	return {
		id: stationIdCounter,
		user: 1,
		name: data.name ?? 'New Station',
		city_name: data.city_name ?? 'Unknown',
		latitude: data.latitude ?? 48.1486,
		longitude: data.longitude ?? 17.1077,
		created_at: new Date().toISOString()
	};
}

export function mockUpdateStation(id: number, data: Partial<Station>): Station {
	const existing = stations.find((s) => s.id === id);
	return { ...existing!, ...data, id: existing!.id };
}

export function mockDeleteStation() {}

export function mockDeleteMeasurement() {}

export function mockDeleteMeasurements() {}

export function mockSetUsername() {}

export function mockSetPassword() {}

export function mockDeleteAccount() {}
