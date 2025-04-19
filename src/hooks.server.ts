import { authApi } from '$lib/shared/api';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('access_token');
	const refreshToken = event.cookies.get('refresh_token');

	if (accessToken) {
		try {
			const user = await authApi.getUsersMe(accessToken);
			event.locals.accessToken = accessToken;
			event.locals.user = user;
		} catch {
			try {
				const res = await authApi.refreshJwt(refreshToken!);
				event.cookies.set('access_token', res.access, { path: '/' });
			} catch {
				event.cookies.delete('access_token', { path: '/' });
				event.cookies.delete('refresh_token', { path: '/' });
			}
			redirect(308, event.url);
		}
	}

	const response = await resolve(event);
	return response;
};
