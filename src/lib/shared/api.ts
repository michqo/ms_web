import axios, { type AxiosInstance } from 'axios';
import dayjs, { type Dayjs } from 'dayjs';
import { API_BASE_URL } from '@/shared/config';
import { normalizeMeasurement, normalizeStats, validDate, normalizeForecast } from './weather';
import {
	mockGetForecast,
	mockGetLatestMeasurement,
	mockGetMeasurements,
	mockGetMeasurementStats,
	mockGetStations
} from './mock';
import type { DeleteSchema, LoginSchema, PasswordSchema, UsernameSchema } from './schemas';
import type {
	CurrentUser,
	Forecast,
	ListResponse,
	LoginResponse,
	Measurement,
	RefreshJWTResponse,
	Station
} from './types';

class ApiClient {
	protected instance: AxiosInstance;
	constructor(token = '') {
		this.instance = axios.create({ baseURL: API_BASE_URL, timeout: 8000 });
		this.setAuthToken(token);
	}
	setAuthToken(token: string) {
		if (token) this.instance.defaults.headers.common.Authorization = `JWT ${token}`;
		else delete this.instance.defaults.headers.common.Authorization;
	}
}
class AuthenticationApi extends ApiClient {
	async exchangeOAuthTicket(code: string): Promise<LoginResponse> {
		return (await this.instance.post('/auth/social/token/', { code })).data;
	}
	async createJwt(credentials: LoginSchema): Promise<LoginResponse> {
		return (await this.instance.post('/auth/jwt/create/', credentials)).data;
	}
	async postUser(credentials: LoginSchema) {
		return (await this.instance.post('/auth/users/', credentials)).data;
	}
	async refreshJwt(refresh: string): Promise<RefreshJWTResponse> {
		return (await this.instance.post('/auth/jwt/refresh/', { refresh })).data;
	}
	async getUsersMe(token: string): Promise<CurrentUser> {
		return (
			await this.instance.get('/auth/users/me/', { headers: { Authorization: `JWT ${token}` } })
		).data;
	}
}
export class WeatherApi extends ApiClient {
	constructor(
		token = '',
		private isDemo: () => boolean = () => false
	) {
		super(token);
	}
	private writable() {
		if (this.isDemo()) throw new Error('Sample data is read-only');
	}
	async getStations(): Promise<ListResponse<Station>> {
		if (this.isDemo()) return mockGetStations();
		const results: Station[] = [];
		for (let page = 1; page <= 100; page++) {
			const { data } = await this.instance.get<ListResponse<Station>>('/api/stations/', {
				params: { page }
			});
			results.push(...data.results);
			if (!data.next) {
				if (results.length !== data.count) throw new Error('Incomplete station list');
				return { count: results.length, results, next: null, previous: null };
			}
			if (!data.results.length) throw new Error('Incomplete station list');
		}
		throw new Error('Station list exceeds request limit');
	}
	async getLatestMeasurement(station: number): Promise<Measurement | null> {
		try {
			return normalizeMeasurement(
				this.isDemo()
					? mockGetLatestMeasurement(station)
					: (await this.instance.get('/api/measurements/latest/', { params: { station } })).data
			);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) return null;
			throw error;
		}
	}
	async getMeasurementStats(station: number, gt: string, lt: string) {
		if (
			!validDate(gt) ||
			!validDate(lt) ||
			gt > lt ||
			dayjs.utc(lt).diff(dayjs.utc(gt), 'day') > 365
		)
			throw new Error('Invalid date range');
		// The API accepts inclusive UTC dates, at most seven days apart.
		const stats = [];
		for (let start = dayjs.utc(gt); !start.isAfter(dayjs.utc(lt)); start = start.add(7, 'day')) {
			const end = start.add(6, 'day').isAfter(dayjs.utc(lt)) ? dayjs.utc(lt) : start.add(6, 'day');
			const from = start.format('YYYY-MM-DD'),
				to = end.format('YYYY-MM-DD');
			const data = this.isDemo()
				? mockGetMeasurementStats(station, from, to)
				: (
						await this.instance.get('/api/measurements/stats/', {
							params: { station, timestamp__gt: from, timestamp__lt: to }
						})
					).data;
			stats.push(...normalizeStats(data));
		}
		return stats.sort((a, b) => a.date.valueOf() - b.date.valueOf());
	}
	async getMeasurements(
		station: number,
		page: number,
		date: Dayjs,
		pageSize = 10
	): Promise<ListResponse<Measurement>> {
		const data = this.isDemo()
			? mockGetMeasurements(station, page, date, pageSize)
			: (
					await this.instance.get('/api/measurements/', {
						params: {
							station,
							page,
							timestamp_date: date.format('YYYY-MM-DD'),
							page_size: pageSize
						}
					})
				).data;
		return { ...data, results: data.results.map(normalizeMeasurement) };
	}
	async getDayMeasurements(station: number, date: Dayjs) {
		const readings: Measurement[] = [];
		let expectedCount: number | undefined;
		const ids = new Set<number>();
		for (let page = 1; page <= 50; page++) {
			const data = await this.getMeasurements(station, page, date, 30);
			if (expectedCount !== undefined && data.count !== expectedCount)
				throw new Error('Day changed during retrieval');
			expectedCount = data.count;
			for (const reading of data.results) {
				if (reading.id !== undefined) {
					if (ids.has(reading.id)) throw new Error('Duplicate reading in day series');
					ids.add(reading.id);
				}
			}
			readings.push(...data.results);
			if (!data.next) {
				if (readings.length !== data.count) throw new Error('Incomplete day series');
				return readings.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());
			}
			if (!data.results.length) throw new Error('Incomplete day series');
		}
		throw new Error('Day series exceeds the request limit');
	}
	async getForecast(station: number): Promise<Forecast> {
		return normalizeForecast(
			this.isDemo()
				? mockGetForecast(station)
				: (await this.instance.get('/api/forecast/', { params: { station } })).data
		);
	}
	async getUsersMe(): Promise<CurrentUser> {
		return (await this.instance.get('/auth/users/me/')).data;
	}
	async setUsername(profile: UsernameSchema) {
		this.writable();
		await this.instance.post('/auth/users/set_username/', profile);
	}
	async setPassword(profile: Omit<PasswordSchema, 'confirm_password'>) {
		this.writable();
		await this.instance.post('/auth/users/set_password/', profile);
	}
	async deleteAccount(profile: DeleteSchema) {
		this.writable();
		await this.instance.delete('/auth/users/me/', { data: profile });
	}
	async deleteMeasurement(id: number) {
		this.writable();
		await this.instance.delete(`/api/measurements/${id}/`);
	}
	async deleteMeasurements(station: number, gt?: string, lt?: string) {
		this.writable();
		await this.instance.delete('/api/measurements/bulk-delete/', {
			params: { station, timestamp__gt: gt, timestamp__lt: lt }
		});
	}
	async createStation(station: Partial<Station>): Promise<Station> {
		this.writable();
		return (await this.instance.post('/api/stations/', station)).data;
	}
	async updateStation(id: number, station: Partial<Station>): Promise<Station> {
		this.writable();
		return (await this.instance.put(`/api/stations/${id}/`, station)).data;
	}
	async deleteStation(id: number) {
		this.writable();
		await this.instance.delete(`/api/stations/${id}/`);
	}
}
export const createApiClient = (token = '', isDemo?: () => boolean) =>
	new WeatherApi(token, isDemo);
export const authApi = new AuthenticationApi();
