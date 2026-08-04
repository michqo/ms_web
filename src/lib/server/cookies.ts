import { dev } from '$app/environment';
import { createTokenCookieOptions } from './cookie-options';

export const TOKEN_COOKIE_OPTIONS = createTokenCookieOptions(dev);
