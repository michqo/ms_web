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

export type { ListResponse, LoginResponse, Measurement, PostUserErrorResponse, RefreshJWTResponse, ChartData };

