import { PUBLIC_API_URL } from '$env/static/public';
import axios, { type CreateAxiosDefaults } from 'axios';
import type { LoginSchema } from './schemas';
import type { LoginResponse, RefreshJWTResponse, Measurement, ListResponse } from './types';

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

  async getMeasurements(): Promise<Measurement[]> {
    const response = await this.instance.get<ListResponse<Measurement>>('/api/measurements/');
    return response.data.results;
  }
}

const authApi = new AuthenticationApi();
const authenticatedApi = new AuthenticatedApi();

export { authApi, authenticatedApi as api };
