// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { get } from 'svelte/store';

vi.mock('$app/environment', () => ({ dev: false }));

import OAuthButtons, { buildOAuthActionUrls } from './OAuthButtons.svelte';
import { APP_CONTEXT, createAppState } from '@/shared/runes.svelte';
const globalState = createAppState();
import { t } from '@/translations';

const rendered: Array<{ component: Record<string, never>; target: HTMLDivElement }> = [];

function renderOAuthButtons() {
	const target = document.createElement('div');
	document.body.append(target);
	const component = mount(OAuthButtons, {
		target,
		context: new Map([[APP_CONTEXT, { state: globalState }]])
	});
	flushSync();
	rendered.push({ component, target });
	return target;
}

afterEach(() => {
	for (const { component, target } of rendered.splice(0)) {
		unmount(component);
		target.remove();
	}
	globalState.demo = false;
});

describe('buildOAuthActionUrls', () => {
	it.each([
		['http://localhost:8000', 'http://localhost:8000/auth/social/login/google-oauth2/'],
		['https://api.example.com/', 'https://api.example.com/auth/social/login/google-oauth2/'],
		['https://api.example.com/api/', 'https://api.example.com/auth/social/login/google-oauth2/']
	])('keeps the Google OAuth path rooted for API base %s', (baseUrl, googleUrl) => {
		expect(buildOAuthActionUrls(baseUrl)).toEqual({
			google: googleUrl,
			github: googleUrl.replace('google-oauth2', 'github')
		});
	});
});

describe('OAuthButtons', () => {
	it('renders two accessible top-level POST forms for the providers', () => {
		const target = renderOAuthButtons();
		const forms = target.querySelectorAll('form');
		const buttons = target.querySelectorAll('button');
		const translate = get(t);

		expect(forms).toHaveLength(2);
		expect(forms[0].getAttribute('method')).toBe('POST');
		expect(forms[0].action).toBe('http://localhost:8000/auth/social/login/google-oauth2/');
		expect(forms[1].getAttribute('method')).toBe('POST');
		expect(forms[1].action).toBe('http://localhost:8000/auth/social/login/github/');
		expect(buttons[0].type).toBe('submit');
		expect(buttons[0].textContent).toContain(translate('auth.oauth_google'));
		expect(buttons[1].textContent).toContain(translate('auth.oauth_github'));
		expect(target.textContent).toContain(translate('auth.oauth_or'));
		expect(target.querySelectorAll('svg[aria-hidden="true"][focusable="false"]')).toHaveLength(2);
	});

	it('disables both providers after submit and restores them on pageshow', () => {
		const target = renderOAuthButtons();
		const forms = target.querySelectorAll('form');
		const buttons = target.querySelectorAll('button');

		forms[0].addEventListener('submit', (event) => event.preventDefault());
		buttons[0].click();
		flushSync();

		expect(buttons[0].disabled).toBe(true);
		expect(buttons[1].disabled).toBe(true);

		window.dispatchEvent(new Event('pageshow'));
		flushSync();

		expect(buttons[0].disabled).toBe(false);
		expect(buttons[1].disabled).toBe(false);
	});

	it('hides provider controls in mock mode', () => {
		globalState.demo = true;
		const target = renderOAuthButtons();

		expect(target.querySelectorAll('form')).toHaveLength(0);
	});
});
