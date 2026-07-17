import { PUBLIC_API_URL } from '$env/static/public';
import axios, { type CreateAxiosDefaults, type AxiosInstance } from 'axios';
import type { Dayjs } from 'dayjs';
import type { DeleteSchema, LoginSchema, PasswordSchema, UsernameSchema } from './schemas';
import type {
	Forecast,
	ListResponse,
	LoginResponse,
	Measurement,
	MeasurementStat,
	RefreshJWTResponse,
	Station
} from './types';
import {
	delay as mockDelay,
	mockAuthGetUser,
	mockAuthLogin,
	mockAuthRegister,
	mockCreateStation,
	mockDeleteAccount,
	mockDeleteMeasurement,
	mockDeleteMeasurements,
	mockDeleteStation,
	mockGetForecast,
	mockGetLatestMeasurement,
	mockGetMeasurementStats,
	mockGetMeasurements,
	mockGetStations,
	mockSetPassword,
	mockSetUsername,
	mockUpdateStation
} from './mock';
import { isMockMode } from './mock-mode';

const instanceConfig: CreateAxiosDefaults = {
	baseURL: PUBLIC_API_URL,
	validateStatus(status) {
		return status < 400;
	}
};

class AxiosInterceptor {
	protected instance = axios.create(instanceConfig);
	protected get: AxiosInstance['get'];
	protected post: AxiosInstance['post'];
	protected put: AxiosInstance['put'];
	protected delete: AxiosInstance['delete'];

	constructor() {
		this.instance.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response && error.response.status === 401) {
					this.setAuthToken('');
				}
				return Promise.reject(error);
			}
		);

		this.get = this.instance.get.bind(this.instance);
		this.post = this.instance.post.bind(this.instance);
		this.put = this.instance.put.bind(this.instance);
		this.delete = this.instance.delete.bind(this.instance);
	}

	setAuthToken(token: string) {
		if (token === '') {
			delete this.instance.defaults.headers.common['Authorization'];
			return;
		}
		this.instance.defaults.headers.common['Authorization'] = `JWT ${token}`;
	}
}

class AuthenticationApi extends AxiosInterceptor {
	async createJwt(credentials: LoginSchema): Promise<LoginResponse> {
		if (isMockMode()) return mockAuthLogin(credentials);
		const response = await this.post('/auth/jwt/create/', credentials);
		return response.data;
	}

	async postUser(credentials: LoginSchema): Promise<any> {
		if (isMockMode()) return mockAuthRegister();
		const response = await this.post('/auth/users/', credentials);
		return response.data;
	}

	async refreshJwt(refresh: string): Promise<RefreshJWTResponse> {
		if (isMockMode()) return { access: 'mock_access_token_xxx' };
		const response = await this.post('/auth/jwt/refresh/', { refresh });
		return response.data;
	}

	async getUsersMe(token?: string): Promise<string> {
		if (isMockMode()) return mockAuthGetUser();
		const headers = token ? { Authorization: `JWT ${token}` } : undefined;
		const response = await this.get('/auth/users/me/', { headers });
		return response.data.username;
	}
}

class AuthenticatedApi extends AxiosInterceptor {
	async setUsername(profile: UsernameSchema) {
		if (isMockMode()) return mockSetUsername();
		await this.post('/auth/users/set_username/', profile);
	}

	async setPassword(profile: Omit<PasswordSchema, 'confirm_password'>) {
		if (isMockMode()) return mockSetPassword();
		await this.post('/auth/users/set_password/', profile);
	}

	async deleteAccount(profile: DeleteSchema) {
		if (isMockMode()) return mockDeleteAccount();
		await this.delete('/auth/users/me/', { data: profile });
	}

	async getUsersMe(): Promise<string> {
		if (isMockMode()) return mockAuthGetUser();
		const response = await this.get('/auth/users/me/');
		return response.data.username;
	}

	async getMeasurements(
		station: number,
		page: number = 1,
		date: Dayjs,
		pageSize: number = 10
	): Promise<ListResponse<Measurement>> {
		if (isMockMode()) return mockGetMeasurements(station, page, date, pageSize);
		const params = new URLSearchParams();
		params.append('station', station.toString());
		params.append('page', page.toString());
		params.append('timestamp_date', date.format('YYYY-MM-DD'));
		params.append('page_size', pageSize.toString());
		const response = await this.get<ListResponse<Measurement>>('/api/measurements/', {
			params
		});
		return response.data;
	}

	async getMeasurementStats(station: number, gt: string, lt: string): Promise<MeasurementStat[]> {
		if (isMockMode()) return mockGetMeasurementStats(station, gt, lt);
		const params = new URLSearchParams();
		params.append('station', station.toString());
		params.append('timestamp__gt', gt);
		params.append('timestamp__lt', lt);
		const response = await this.get<MeasurementStat[]>('/api/measurements/stats/', {
			params
		});
		return response.data;
	}

	async getLatestMeasurement(station: number): Promise<Measurement> {
		if (isMockMode()) return mockGetLatestMeasurement(station);
		const params = new URLSearchParams();
		params.append('station', station.toString());
		const response = await this.get<Measurement>('/api/measurements/latest/', {
			params
		});
		return response.data;
	}

	async deleteMeasurement(measurementId: number): Promise<void> {
		if (isMockMode()) return mockDeleteMeasurement();
		await this.delete(`/api/measurements/${measurementId}/`);
	}

	async deleteMeasurements(stationId: number, gt?: string, lt?: string): Promise<void> {
		if (isMockMode()) return mockDeleteMeasurements();
		const params = new URLSearchParams();
		params.append('station', stationId.toString());
		if (gt) params.append('timestamp__gt', gt);
		if (lt) params.append('timestamp__lt', lt);

		await this.delete('/api/measurements/bulk-delete/', { params });
	}

	async getForecast(station: number): Promise<Forecast> {
		if (isMockMode()) return mockGetForecast(station);
		const params = new URLSearchParams();
		params.append('station', station.toString());
		const response = await this.get<Forecast>('/api/forecast/', { params });
		return response.data;
	}

	async getStations(): Promise<ListResponse<Station>> {
		if (isMockMode()) return mockGetStations();
		const response = await this.get<ListResponse<Station>>('/api/stations/');
		return response.data;
	}

	async updateStation(stationId: number, station: Partial<Station>): Promise<Station> {
		if (isMockMode()) return mockUpdateStation(stationId, station);
		const response = await this.put<Station>(`/api/stations/${stationId}/`, station);
		return response.data;
	}

	async deleteStation(stationId: number): Promise<void> {
		if (isMockMode()) return mockDeleteStation();
		await this.delete(`/api/stations/${stationId}/`);
	}

	async createStation(station: Partial<Station>): Promise<Station> {
		if (isMockMode()) return mockCreateStation(station);
		const response = await this.post<Station>('/api/stations/', station);
		return response.data;
	}
}

const authApi = new AuthenticationApi();
const authenticatedApi = new AuthenticatedApi();

export { authenticatedApi as api, authApi };
