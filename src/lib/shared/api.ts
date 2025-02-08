import { PUBLIC_API_URL } from '$env/static/public';
import axios, { type CreateAxiosDefaults } from 'axios';
import type { LoginSchema } from './schemas';
import type { LoginResponse, RefreshJWTResponse, Measurement, Forecast, ListResponse, ForecastTransformed } from './types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudSun } from 'lucide-svelte';

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

const weatherIcons: { [key: number]: any } = {
  1: Sun,            // Sunny, cloudless sky
  2: Sun,          // Sunny and few clouds
  3: Cloud,          // Partly cloudy
  4: CloudSun,          // Overcast
  5: CloudFog,       // Fog
  6: CloudRain,      // Overcast with rain
  7: CloudLightning, // Mixed with showers
  8: CloudLightning, // Showers, thunderstorms likely
  9: CloudSnow,      // Overcast with snow
  10: CloudSnow,     // Mixed with snow showers
  11: CloudRain,     // Mostly cloudy with a mixture of snow and rain
  12: CloudRain,     // Overcast with light rain
  13: CloudSnow,     // Overcast with light snow
  14: CloudRain,     // Mostly cloudy with rain
  15: CloudSnow,     // Mostly cloudy with snow
  16: CloudRain,     // Mostly cloudy with light rain
  17: CloudSnow,     // Mostly cloudy with light snow
};

const transformForecast = (forecast: Forecast): ForecastTransformed[] =>
  forecast.time
    .map((time, index) => ({
      time: dayjs(time),
      icon: weatherIcons[forecast.pictocode[index]] || Cloud,
      temperature_mean: forecast.temperature_mean[index],
      temperature_instant: forecast.temperature_instant[index],
      temperature_max: forecast.temperature_max[index],
      temperature_min: forecast.temperature_min[index],
      relativehumidity_mean: forecast.relativehumidity_mean[index],
      windspeed_mean: forecast.windspeed_mean[index],
      sealevelpressure_mean: forecast.sealevelpressure_mean[index],
      precipitation: forecast.precipitation[index],
      precipitation_hours: forecast.precipitation_hours[index],
      predictability: forecast.predictability[index],
      pictocode: forecast.pictocode[index],
      winddirection: forecast.winddirection[index],
      uvindex: forecast.uvindex[index]
    }))
    .filter(item => item.time.isAfter(dayjs().startOf('day').subtract(1, 'millisecond')));

export { authApi, authenticatedApi as api, transformForecast };
