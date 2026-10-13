import { authApi } from '$lib/shared/api';
import { TOKEN_COOKIE_OPTIONS } from '$lib/server/cookies';
import { redirect, type Handle } from '@sveltejs/kit';
import { isAxiosError } from 'axios';
const rejected = (error: unknown) =>
	isAxiosError(error) && [400, 401, 403].includes(error.response?.status ?? 0);
export const handle: Handle = async ({ event, resolve }) => {
	const access = event.cookies.get('access_token');
	const refresh = event.cookies.get('refresh_token');
	// Sample routes do not contact the authentication or weather backend.
	if (!event.url.pathname.startsWith('/demo') && (access || refresh)) {
		let needsRefresh = !access;
		if (access) {
			try {
				event.locals.user = await authApi.getUsersMe(access);
				event.locals.accessToken = access;
			} catch (error) {
				needsRefresh = rejected(error);
				if (!needsRefresh) event.locals.authUnavailable = true;
			}
		}
		if (needsRefresh) {
			if (refresh) {
				try {
					const renewed = await authApi.refreshJwt(refresh);
					const user = await authApi.getUsersMe(renewed.access);
					event.cookies.set('access_token', renewed.access, TOKEN_COOKIE_OPTIONS);
					event.locals.accessToken = renewed.access;
					event.locals.user = user;
				} catch (error) {
					if (rejected(error)) {
						event.cookies.delete('access_token', TOKEN_COOKIE_OPTIONS);
						event.cookies.delete('refresh_token', TOKEN_COOKIE_OPTIONS);
					} else {
						event.locals.authUnavailable = true;
					}
				}
			} else {
				event.cookies.delete('access_token', TOKEN_COOKIE_OPTIONS);
			}
		}
	}
	if (event.url.pathname === '/' && event.locals.user) redirect(303, '/dash');
	const response = await resolve(event);
	if (access || refresh) response.headers.set('cache-control', 'private, no-store');
	return response;
};
