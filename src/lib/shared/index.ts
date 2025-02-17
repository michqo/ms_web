/**
 * Generic shared functions
 */

import ClearDay from '@/components/svgs/clear-day.svelte';
import Drizzle from '@/components/svgs/drizzle.svelte';
import Fog from '@/components/svgs/fog.svelte';
import LightningBolt from '@/components/svgs/lightning-bolt.svelte';
import OverCastDay from '@/components/svgs/overcast-day.svelte';
import Overcast from '@/components/svgs/overcast.svelte';
import { default as PartlyCloudyDayRain, default as PartlyCloudyRain } from '@/components/svgs/partly-cloudy-day-rain.svelte';
import PartlyCloudyDaySleet from '@/components/svgs/partly-cloudy-day-sleet.svelte';
import PartlyCloudyDaySnow from '@/components/svgs/partly-cloudy-day-snow.svelte';
import PartlyCloudyDay from '@/components/svgs/partly-cloudy-day.svelte';
import Snow from '@/components/svgs/snow.svelte';
import dayjs from 'dayjs';
import type { Forecast, ForecastTransformed } from './types';
import { goto } from '$app/navigation';
import { api, authApi } from './api';

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

const setParam = (key: string, value: string) => {
  const params = new URLSearchParams(location.search);
  params.set(key, value);
  goto(`?${params.toString()}`);
}

export {
  transformForecast,
  setParam,
  authApi,
  api
}
