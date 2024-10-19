import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';
import type { LayoutLoad } from './$types';
import { setAuthToken, api } from '@/shared/api';

export const load = (async ({data, fetch}) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				refetchOnWindowFocus: false
			}
		}
	});

	const accessToken = data.accessToken;
  if (accessToken) {
    setAuthToken(accessToken);
    const prefetchedUser = queryClient.prefetchQuery({
      queryKey: ['usersMe'],
      queryFn: () => api().getUsersMe(),
      initialData: data.user
    });
    await Promise.all([prefetchedUser]);
    return { queryClient, accessToken };
  }
	
	return { queryClient };
}) satisfies LayoutLoad;
