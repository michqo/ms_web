<script lang="ts" module>
	export function buildOAuthActionUrls(apiBaseUrl: string) {
		const normalizedBase = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;

		return {
			google: new URL('/auth/social/login/google-oauth2/', normalizedBase).toString(),
			github: new URL('/auth/social/login/github/', normalizedBase).toString()
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import { Button } from './button';

	const actionUrls = buildOAuthActionUrls(PUBLIC_API_URL);
	let submitting = $state(false);

	function startSubmission() {
		submitting = true;
	}

	onMount(() => {
		const restoreControls = () => {
			submitting = false;
		};

		window.addEventListener('pageshow', restoreControls);

		return () => {
			window.removeEventListener('pageshow', restoreControls);
		};
	});
</script>

{#if !globalState.mockMode}
	<div class="space-y-3 px-6" data-slot="oauth-buttons">
		<form method="POST" action={actionUrls.google} onsubmit={startSubmission}>
			<Button type="submit" variant="outline" class="w-full" disabled={submitting}>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="size-4">
					<path
						fill="#4285F4"
						d="M21.8 12.2c0-.7-.1-1.3-.2-2H12v3.7h5.5a4.7 4.7 0 0 1-2 3.1v2.4h3.2c1.9-1.8 3.1-4.3 3.1-7.2Z"
					/>
					<path
						fill="#34A853"
						d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.4c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9V16A10 10 0 0 0 12 22Z"
					/>
					<path
						fill="#FBBC05"
						d="M6.2 13.7A6 6 0 0 1 5.9 12c0-.6.1-1.1.3-1.7V7.9H2.9A10 10 0 0 0 2 12c0 1.5.4 2.9.9 4.1l3.3-2.4Z"
					/>
					<path
						fill="#EA4335"
						d="M12 6c1.5 0 2.9.5 3.9 1.5l2.9-2.9C17 2.9 14.8 2 12 2A10 10 0 0 0 2.9 7.9l3.3 2.4C7 7.8 9.3 6 12 6Z"
					/>
				</svg>
				{$t('auth.oauth_google')}
			</Button>
		</form>

		<form method="POST" action={actionUrls.github} onsubmit={startSubmission}>
			<Button type="submit" variant="outline" class="w-full" disabled={submitting}>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="size-4 fill-current">
					<path
						d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .9.1-.6.4-1.1.7-1.4-2.3-.3-4.7-1.1-4.7-5A3.9 3.9 0 0 1 6.7 8c-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1A9.8 9.8 0 0 1 12 6c.8 0 1.7.1 2.4.3 1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1.1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"
					/>
				</svg>
				{$t('auth.oauth_github')}
			</Button>
		</form>

		<div class="text-muted-foreground flex items-center gap-3 py-1 text-xs" role="separator">
			<div class="bg-border h-px flex-1"></div>
			<span>{$t('auth.oauth_or')}</span>
			<div class="bg-border h-px flex-1"></div>
		</div>
	</div>
{/if}
