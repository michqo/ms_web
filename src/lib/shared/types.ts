import type { Dayjs } from "dayjs";

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
	timestamp: string;
	temperature: number;
	humidity: number;
	pressure: number;
	rain: number;
	wind_speed: number;
	wind_direction: number;
	created_at: string;
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
};

type ForecastArray = {
  [K in keyof ForecastBase]: ForecastBase[K][];
};

interface Forecast extends ForecastArray {
  id: number;
  latitude: number;
  longitude: number;
  modelrun_utc: string;
  utc_timeoffset: number;
  generation_time_ms: number;
  created_at: string;
}

export type { ChartData, Forecast, ForecastBase, ForecastTransformed, ListResponse, LoginResponse, Measurement, PostUserErrorResponse, RefreshJWTResponse };

