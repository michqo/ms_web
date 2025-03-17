import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';
import type { LayoutLoad } from './$types';
import { api } from '@/shared/api';

export const load = (async ({data, fetch}) => {
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
    return { queryClient, accessToken, form, user: data.user };
  }
	
	return { queryClient, form };
}) satisfies LayoutLoad;
