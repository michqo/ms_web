import type { Dayjs } from 'dayjs';

interface LoginResponse {
	refresh: string;
	access: string;
}

interface PostUserErrorResponse {
	username?: string[];
	password?: string[];
}

interface RefreshJWTResponse {
	access: string;
}

interface ListResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

interface Measurement {
	id?: number;
	timestamp: Dayjs;
	temperature: number;
	humidity: number;
	pressure: number | null;
	rain: number | null;
	wind_speed: number | null;
	wind_direction: number | null;
	created_at: string;
}

export type MeasurementDTO = Omit<Measurement, 'timestamp'> & { timestamp: string };
export type MeasurementStatDTO = Omit<MeasurementStat, 'date'> & { date: string };

interface MeasurementStat {
	temperature: number;
	humidity: number;
	station: number;
	date: Dayjs;
}

interface ChartData {
	date: Date;
	value: string | number;
}

interface ForecastBase {
	time: Dayjs;
	temperature_mean: number;
	temperature_instant: number;
	temperature_max: number;
	temperature_min: number;
	relativehumidity_mean: number;
	windspeed_mean: number;
	sealevelpressure_mean: number;
	precipitation: number;
	precipitation_hours: number;
	predictability: number;
	pictocode: number;
	winddirection: number;
	uvindex: number;
}

interface ForecastTransformed extends ForecastBase {
	icon: any;
}

type ForecastArray = {
	[K in keyof ForecastBase]: ForecastBase[K][];
};

interface Forecast extends Omit<ForecastArray, 'time'> {
	time: string[];
	id: number;
	latitude: number;
	longitude: number;
	city_name: string;
	modelrun_utc: string;
	utc_timeoffset: number;
	generation_time_ms: number;
	created_at: string;
}

interface Station {
	id: number;
	user: number;
	name: string;
	city_name: string;
	latitude: number;
	longitude: number;
	created_at: string;
}

interface CurrentUser {
	id?: number;
	username: string;
	email: string;
	has_usable_password: boolean;
	social_providers: string[];
}

export type {
	ChartData,
	CurrentUser,
	Forecast,
	ForecastBase,
	ForecastTransformed,
	ListResponse,
	LoginResponse,
	Measurement,
	MeasurementStat,
	PostUserErrorResponse,
	RefreshJWTResponse,
	Station
};
