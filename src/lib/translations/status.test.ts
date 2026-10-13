import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import i18n from 'sveltekit-i18n';
import en from './en/dash.json';
import sk from './sk/dash.json';

describe('station update status', () => {
	it.each([
		['en', en],
		['sk', sk]
	] as const)('includes the elapsed time in %s', async (locale, messages) => {
		const translations = new i18n({ translations: { [locale]: { status: messages.status } } });
		await translations.loadTranslations(locale);
		translations.locale.set(locale);
		const translate = get(translations.t) as (key: string, payload: { time: string }) => string;
		for (const key of ['updatedAgo', 'lastSeenAgo']) {
			expect(translate(`status.${key}`, { time: '7m' })).toContain('7m');
		}
	});
});
