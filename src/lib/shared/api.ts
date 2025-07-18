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
		const response = await this.post('/auth/jwt/create/', credentials);
		return response.data;
	}

	async postUser(credentials: LoginSchema): Promise<any> {
		const response = await this.post('/auth/users/', credentials);
		return response.data;
	}

	async refreshJwt(refresh: string): Promise<RefreshJWTResponse> {
		const response = await this.post('/auth/jwt/refresh/', { refresh });
		return response.data;
	}

	async getUsersMe(token?: string): Promise<string> {
		const headers = token ? { Authorization: `JWT ${token}` } : undefined;
		const response = await this.get('/auth/users/me/', { headers });
		return response.data.username;
	}
}

class AuthenticatedApi extends AxiosInterceptor {
	async setUsername(profile: UsernameSchema) {
		await this.post('/auth/users/set_username/', profile);
	}

	async setPassword(profile: Omit<PasswordSchema, 'confirm_password'>) {
		await this.post('/auth/users/set_password/', profile);
	}

	async deleteAccount(profile: DeleteSchema) {
		await this.delete('/auth/users/me/', { data: profile });
	}

	async getUsersMe(): Promise<string> {
		const response = await this.get('/auth/users/me/');
		return response.data.username;
	}

	async getMeasurements(
		station: number,
		page: number = 1,
		date: Dayjs,
		pageSize: number = 10
	): Promise<ListResponse<Measurement>> {
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
		const params = new URLSearchParams();
		params.append('station', station.toString());
		const response = await this.get<Measurement>('/api/measurements/latest/', {
			params
		});
		return response.data;
	}

	async deleteMeasurement(measurementId: number): Promise<void> {
		await this.delete(`/api/measurements/${measurementId}/`);
	}

	async deleteMeasurements(stationId: number, gt?: string, lt?: string): Promise<void> {
		const params = new URLSearchParams();
		params.append('station', stationId.toString());
		if (gt) params.append('timestamp__gt', gt);
		if (lt) params.append('timestamp__lt', lt);

		await this.delete('/api/measurements/bulk-delete/', { params });
	}

	async getForecast(station: number): Promise<Forecast> {
		const params = new URLSearchParams();
		params.append('station', station.toString());
		const response = await this.get<Forecast>('/api/forecast/', { params });
		return response.data;
	}

	async getStations(): Promise<ListResponse<Station>> {
		const response = await this.get<ListResponse<Station>>('/api/stations/');
		return response.data;
	}

	async updateStation(stationId: number, station: Partial<Station>): Promise<Station> {
		const response = await this.put<Station>(`/api/stations/${stationId}/`, station);
		return response.data;
	}

	async deleteStation(stationId: number): Promise<void> {
		await this.delete(`/api/stations/${stationId}/`);
	}

	async createStation(station: Partial<Station>): Promise<Station> {
		const response = await this.post<Station>('/api/stations/', station);
		return response.data;
	}
}

const authApi = new AuthenticationApi();
const authenticatedApi = new AuthenticatedApi();

export { authenticatedApi as api, authApi };
