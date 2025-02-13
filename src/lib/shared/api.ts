import { PUBLIC_API_URL } from '$env/static/public';
import axios, { type CreateAxiosDefaults } from 'axios';
import type { LoginSchema } from './schemas';
import type { LoginResponse, RefreshJWTResponse, Measurement, Forecast, ListResponse, ForecastTransformed, Station } from './types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import ClearDay from '@/components/svgs/clear-day.svelte';
import OverCastDay from '@/components/svgs/overcast-day.svelte';
import PartlyCloudyDay from '@/components/svgs/partly-cloudy-day.svelte';
import Overcast from '@/components/svgs/overcast.svelte';
import Fog from '@/components/svgs/fog.svelte';
import Drizzle from '@/components/svgs/drizzle.svelte';
import PartlyCloudyRain from '@/components/svgs/partly-cloudy-day-rain.svelte';
import LightningBolt from '@/components/svgs/lightning-bolt.svelte';
import Snow from '@/components/svgs/snow.svelte';
import PartlyCloudyDaySnow from '@/components/svgs/partly-cloudy-day-snow.svelte';
import PartlyCloudyDaySleet from '@/components/svgs/partly-cloudy-day-sleet.svelte';
import PartlyCloudyDayRain from '@/components/svgs/partly-cloudy-day-rain.svelte';

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

  async getStations(): Promise<ListResponse<Station>> {
    const response = await this.instance.get<ListResponse<Station>>('/api/stations/');
    return response.data;
  }
}

const authApi = new AuthenticationApi();
const authenticatedApi = new AuthenticatedApi();

const weatherIcons: { [key: number]: any } = {
  1: ClearDay,
  2: OverCastDay,
  3: PartlyCloudyDay,
  4: Overcast,
  5: Fog,
  6: Drizzle,
  7: PartlyCloudyRain,
  8: LightningBolt,
  9: Snow,
  10: PartlyCloudyDaySnow,
  11: PartlyCloudyDaySleet,
  12: Drizzle,
  13: Snow,
  14: PartlyCloudyDayRain,
  15: PartlyCloudyDaySnow,
  16: PartlyCloudyDayRain,
  17: PartlyCloudyDaySnow
};

const transformForecast = (forecast: Forecast): ForecastTransformed[] =>
  forecast.time
    .map((time, index) => ({
      time: dayjs(time),
      icon: weatherIcons[forecast.pictocode[index]] || Overcast,
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
