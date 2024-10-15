import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';
import type { LayoutLoad } from './$types';
import { setAuthHeaders, api } from '@/shared/api';

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
    setAuthHeaders(accessToken);
    const prefetchedUser = queryClient.prefetchQuery({
      queryKey: ['usersMe'],
      queryFn: () => api(fetch).getUsersMe(),
      initialData: data.user
    });
    await Promise.all([prefetchedUser]);
    return { queryClient, accessToken };
  }
	
	return { queryClient };
}) satisfies LayoutLoad;
