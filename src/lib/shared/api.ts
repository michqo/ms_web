import { PUBLIC_API_URL } from '$env/static/public';
import type { LoginSchema } from './schemas';
import type { LoginResponse, RefreshJWTResponse } from './types';

const authApi = (customFetch = fetch) => ({
  createJwt: async (credentials: LoginSchema): Promise<LoginResponse> => {
    const response = await customFetch(`${PUBLIC_API_URL}/auth/jwt/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) {
      throw response.status;
    }
    return response.json();
  },
  postUser: async (credentials: LoginSchema): Promise<any> => {
    const response = await customFetch(`${PUBLIC_API_URL}/auth/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) {
      throw await response.json();
    }
    return await response.json();
  },
  refreshJwt: async (refresh: string): Promise<RefreshJWTResponse> => {
    const response = await customFetch(`${PUBLIC_API_URL}/auth/jwt/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh })
    });
    if (!response.ok) {
      throw response.status;
    }
    return await response.json();
  }
});

const serverApi = (customFetch = fetch, token: string) => ({
  getUsersMe: async (): Promise<string> => {
    const response = await customFetch(`${PUBLIC_API_URL}/auth/users/me/`, {
      headers: {
        Authorization: `JWT ${token}`
      }
    });
    if (!response.ok) {
      throw await response.json();
    }
    return (await response.json()).username;
  }
});

let headers = {};

const setAuthHeaders = (token: string) => {
  headers = {
    Authorization: `JWT ${token}`
  };
};

const api = (customFetch = fetch) => ({
  getUsersMe: async (): Promise<string> => {
    const response = await customFetch(`${PUBLIC_API_URL}/auth/users/me/`, {
      headers
    });
    if (!response.ok) {
      throw await response.json();
    }
    return (await response.json()).username;
  }
});

export { authApi, serverApi, setAuthHeaders, api };
