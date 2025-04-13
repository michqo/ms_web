import { browser } from '$app/environment';
import { api } from '@/shared/api';
import { addTranslations, setLocale, setRoute } from '@/translations';
import { QueryClient } from '@tanstack/svelte-query';
import type { LayoutLoad } from './$types';

export const load = (async ({ data, url }) => {
	const { i18n, translations } = data;
	const { locale, route } = i18n;
	addTranslations(translations);
	await setRoute(route);
	await setLocale(locale);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				refetchOnWindowFocus: false
			}
		}
	});

	const { accessToken, form } = data;
	if (accessToken) {
		api.setAuthToken(accessToken);
		const prefetchedUser = queryClient.prefetchQuery({
			queryKey: ['usersMe'],
			queryFn: () => api.getUsersMe(),
			initialData: data.user
		});
		await Promise.all([prefetchedUser]);
		return { queryClient, accessToken, form, user: data.user, locale, route };
	}

	return { queryClient, form, locale, route };
}) satisfies LayoutLoad;
