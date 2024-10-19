import { PUBLIC_API_URL } from '$env/static/public';
import axios from 'axios';
import type { LoginSchema } from './schemas';
import type { LoginResponse, RefreshJWTResponse } from './types';

const instance = axios.create({
  baseURL: PUBLIC_API_URL,
  validateStatus(status) {
    return status < 400;
  },
});

const authApi = () => ({
  createJwt: async (credentials: LoginSchema): Promise<LoginResponse> => {
    const response = await instance.post('/auth/jwt/create/', credentials);
    return response.data;
  },
  postUser: async (credentials: LoginSchema): Promise<any> => {
    const response = await instance.post('/auth/users/', credentials);
    return response.data;
  },
  refreshJwt: async (refresh: string): Promise<RefreshJWTResponse> => {
    const response = await instance.post('/auth/jwt/refresh/', { refresh });
    return response.data;
  }
});

const serverApi = (token: string) => ({
  getUsersMe: async (): Promise<string> => {
    const response = await instance.get('/auth/users/me/', {
      headers: {
        Authorization: `JWT ${token}`
      }
    });
    return response.data.username;
  }
});

const authInstance = axios.create({
  baseURL: PUBLIC_API_URL
});

const setAuthToken = (token: string) => {
  authInstance.defaults.headers.common['Authorization'] = `JWT ${token}`;
};

const api = () => ({
  getUsersMe: async (): Promise<string> => {
    const response = await authInstance.get('/auth/users/me/');
    return response.data.username;
  }
});

export { authApi, serverApi, setAuthToken, api };
