// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

vi.mock('$app/environment', () => ({
	browser: true,
	building: false,
	dev: false,
	version: 'test'
}));
vi.mock('$app/forms', () => ({ enhance: () => ({ destroy: () => undefined }) }));
vi.mock('__sveltekit/environment', () => ({ building: false, version: 'test' }));
vi.mock('__sveltekit/paths', () => ({ assets: '', base: '' }));

import AuthCard from './AuthCard.svelte';
import { loginSchema } from '@/shared/schemas';
import { APP_CONTEXT, createAppState } from '@/shared/runes.svelte';
const globalState = createAppState();

const rendered: Array<{ component: Record<string, never>; target: HTMLDivElement }> = [];

async function renderAuthCard(id: 'login' | 'register') {
	const target = document.createElement('div');
	document.body.append(target);
	const component = mount(AuthCard, {
		target,
		context: new Map([[APP_CONTEXT, { state: globalState }]]),
		props: {
			id,
			data: await superValidate(zod4(loginSchema)),
			value: id,
			success: () => undefined,
			failed: () => undefined
		}
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

describe('AuthCard', () => {
	it.each(['login', 'register'] as const)(
		'places provider forms before the credential form for %s',
		async (id) => {
			const target = await renderAuthCard(id);
			const forms = target.querySelectorAll('form');

			expect(forms).toHaveLength(3);
			expect(forms[0].action).toBe('http://localhost:8000/auth/social/login/google-oauth2/');
			expect(forms[1].action).toBe('http://localhost:8000/auth/social/login/github/');
			expect(forms[2].action).toBe('http://localhost:3000/actions?/auth');
			expect(forms[2].contains(forms[0])).toBe(false);
			expect(forms[2].contains(forms[1])).toBe(false);
		}
	);
});
