<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '@/components/ui/sonner';
	import Nav from '@/components/ui/nav';
	import StateContext from '@/components/StateContext.svelte';
	import { t } from '@/translations';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import '../app.css';
	import 'dayjs/locale/sk';
	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	const client = new QueryClient({
		defaultOptions: {
			queries: { enabled: browser, staleTime: 60_000, retry: 1, refetchOnWindowFocus: true }
		}
	});
</script>

<ModeWatcher />
<Toaster />
<QueryClientProvider {client}>
	<StateContext
		locale={data.locale}
		user={data.user}
		accessToken={data.accessToken}
		defaultStationId={data.defaultStationId}
		demo={page.url.pathname.startsWith('/demo')}
	>
		<a class="skip-link" href="#main">{$t('weather.skip')}</a>
		<div class="flex min-h-dvh flex-col">
			<Nav authForm={data.authForm} deleteForm={data.deleteForm} />
			{#if data.authUnavailable}<div class="auth-notice" role="status">
					<p>{$t('weather.authUnavailable')}</p>
					<button class="weather-button" onclick={() => invalidateAll()}
						>{$t('weather.retry')}</button
					>
				</div>{/if}
			<main id="main" class="flex-1" tabindex="-1">{@render children()}</main>
			<footer class="workspace-footer">
				<a href="https://miqal.xyz" class="font-mono"><span class="text-primary">/</span>miqal</a><a
					href="https://github.com/michqo/ms_web"
					target="_blank"
					rel="noopener noreferrer">{$t('weather.source')}</a
				>
			</footer>
		</div>
	</StateContext>
</QueryClientProvider>
