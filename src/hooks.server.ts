import { authApi } from '$lib/shared/api';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get('access_token');
  const refreshToken = event.cookies.get('refresh_token');

  const isAuth = event.url.pathname.startsWith('/auth');
  if (!accessToken && !isAuth) {
    redirect(307, '/auth');
  } else if (accessToken && isAuth) {
    redirect(308, '/');
  }

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
        redirect(308, '/auth?for=login');
      }
      redirect(308, event.url);
    }
  }

  const response = await resolve(event);
  return response;
};
