import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';
import { resolveApiOrigin } from './api-origin';

export const API_BASE_URL = resolveApiOrigin(env.PUBLIC_API_URL, dev);
