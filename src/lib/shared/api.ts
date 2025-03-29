import { PUBLIC_API_URL } from '$env/static/public';
import axios, { type CreateAxiosDefaults } from 'axios';
import type { Dayjs } from 'dayjs';
import type {
	DeleteSchema,
	LoginSchema,
	PasswordSchema,
	UsernameSchema
} from './schemas';
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

class AuthenticationApi {
	private instance = axios.create(instanceConfig);

	async createJwt(credentials: LoginSchema): Promise<LoginResponse> {
		const response = await this.instance.post('/auth/jwt/create/', credentials);
		return response.data;
	}

	async postUser(credentials: LoginSchema): Promise<any> {
		const response = await this.instance.post('/auth/users/', credentials);
		return response.data;
	}

	async refreshJwt(refresh: string): Promise<RefreshJWTResponse> {
		const response = await this.instance.post('/auth/jwt/refresh/', { refresh });
		return response.data;
	}

	async getUsersMe(token?: string): Promise<string> {
		const headers = token ? { Authorization: `JWT ${token}` } : undefined;
		const response = await this.instance.get('/auth/users/me/', { headers });
		return response.data.username;
	}
}

class AuthenticatedApi {
	private instance = axios.create(instanceConfig);

	setAuthToken(token: string) {
		if (token === '') {
			delete this.instance.defaults.headers.common['Authorization'];
			return;
		}
		this.instance.defaults.headers.common['Authorization'] = `JWT ${token}`;
	}

	async setUsername(profile: UsernameSchema) {
		await this.instance.post('/auth/users/set_username/', profile);
	}

	async setPassword(profile: Omit<PasswordSchema, 'confirm_password'>) {
		await this.instance.post('/auth/users/set_password/', profile);
	}

	async deleteAccount(profile: DeleteSchema) {
		await this.instance.delete('/auth/users/me/', { data: profile });
	}

	async getUsersMe(): Promise<string> {
		const response = await this.instance.get('/auth/users/me/');
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
		params.append('timestamp__gt', date.startOf('day').toISOString());
		params.append('timestamp__lt', date.endOf('day').toISOString());
		params.append('page_size', pageSize.toString());
		const response = await this.instance.get<ListResponse<Measurement>>('/api/measurements/', {
			params
		});
		return response.data;
	}

	async getMeasurementStats(station: number, gt: string, lt: string): Promise<MeasurementStat[]> {
		const params = new URLSearchParams();
		params.append('station', station.toString());
		params.append('timestamp__gt', gt);
		params.append('timestamp__lt', lt);
		const response = await this.instance.get<MeasurementStat[]>('/api/measurements/stats/', {
			params
		});
		return response.data;
	}

	async getLatestMeasurement(station: number): Promise<Measurement> {
		const params = new URLSearchParams();
		params.append('station', station.toString());
		const response = await this.instance.get<Measurement>('/api/measurements/latest/', {
			params
		});
		return response.data;
	}

	async deleteMeasurement(measurementId: number): Promise<void> {
		await this.instance.delete(`/api/measurements/${measurementId}/`);
	}

	async deleteMeasurements(stationId: number, gt?: string, lt?: string): Promise<void> {
		const params = new URLSearchParams();
		params.append('station', stationId.toString());
		if (gt) params.append('created_at__gt', gt);
		if (lt) params.append('created_at__lt', lt);

		await this.instance.delete('/api/measurements/bulk-delete/', { params });
	}

	async getForecast(station: number): Promise<Forecast> {
		const params = new URLSearchParams();
		params.append('station', station.toString());
		const response = await this.instance.get<Forecast>('/api/forecast/', { params });
		return response.data;
	}

	async getStations(): Promise<ListResponse<Station>> {
		const response = await this.instance.get<ListResponse<Station>>('/api/stations/');
		return response.data;
	}

	async updateStation(stationId: number, station: Partial<Station>): Promise<Station> {
		const response = await this.instance.put<Station>(`/api/stations/${stationId}/`, station);
		return response.data;
	}

	async deleteStation(stationId: number): Promise<void> {
		await this.instance.delete(`/api/stations/${stationId}/`);
	}

	async createStation(station: Partial<Station>): Promise<Station> {
		const response = await this.instance.post<Station>('/api/stations/', station);
		return response.data;
	}
}

const authApi = new AuthenticationApi();
const authenticatedApi = new AuthenticatedApi();

export { authenticatedApi as api, authApi };
