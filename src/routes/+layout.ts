import { browser } from '$app/environment';
import { api } from '@/shared/api';
import { addTranslations, setLocale, setRoute } from '@/translations';
import { QueryClient } from '@tanstack/svelte-query';
import type { LayoutLoad } from './$types';

export const load = (async ({ data, url }) => {
	const { i18n, translations } = data;
	const { locale } = i18n;
	const route = i18n.route === '/' ? '/' : i18n.route.replace(/\/$/, '');
	addTranslations(translations);
	await setLocale(locale);
	await setRoute(route);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				refetchOnWindowFocus: false
			}
		}
	});

	const { accessToken } = data;
	if (accessToken) {
		api.setAuthToken(accessToken);
		const prefetchedUser = queryClient.prefetchQuery({
			queryKey: ['usersMe'],
			queryFn: () => api.getUsersMe(),
			initialData: data.user
		});
		await Promise.all([prefetchedUser]);
		return { ...data, queryClient, locale, route };
	}

	return { ...data, queryClient, locale, route };
}) satisfies LayoutLoad;
