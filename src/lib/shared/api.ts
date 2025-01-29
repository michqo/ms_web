import { PUBLIC_API_URL } from '$env/static/public';
import axios, { type CreateAxiosDefaults } from 'axios';
import type { LoginSchema } from './schemas';
import type { LoginResponse, RefreshJWTResponse, Measurement, Forecast, ListResponse } from './types';
import type { Dayjs } from 'dayjs';

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

  async getUsersMe(): Promise<string> {
    const response = await this.instance.get('/auth/users/me/');
    return response.data.username;
  }

  async getMeasurements(page: number = 1, date: Dayjs): Promise<ListResponse<Measurement>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('timestamp__gt', date.startOf('day').toISOString());
    params.append('timestamp__lt', date.endOf('day').toISOString());
    const response = await this.instance.get<ListResponse<Measurement>>('/api/measurements/', { params });
    return response.data;
  }

  async getForecast(): Promise<Forecast> {
    const response = await this.instance.get<Forecast>('/api/forecast/');
    return response.data;
  }
}

const authApi = new AuthenticationApi();
const authenticatedApi = new AuthenticatedApi();

export { authApi, authenticatedApi as api };
