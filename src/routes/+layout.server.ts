import { deleteSchema, loginSchema } from '@/shared/schemas';
import { defaultLocale, loadTranslations, locales, translations } from '@/translations';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ url, locals, cookies, request }) => {
	const { pathname } = url;

	let locale = (cookies.get('lang') || '').toLowerCase();

	if (!locale) {
		const acceptLanguageHeader = request.headers.get('accept-language') || '';
		let match = acceptLanguageHeader.match(/^[a-z]+(?=[-_])/i);

		if (!match) {
			match = acceptLanguageHeader.match(/^[a-z]+/i);
		}

		locale = match ? match[0].toLowerCase() : defaultLocale;
	}

	const supportedLocales = locales.get().map((l) => l.toLowerCase());
	if (!supportedLocales.includes(locale)) {
		locale = defaultLocale;
	}

	await loadTranslations(locale, pathname);

	return {
		...locals,
		deleteForm: await superValidate(zod(deleteSchema)),
		authForm: await superValidate(zod(loginSchema)),
		i18n: { locale, route: pathname },
		translations: translations.get()
	};
}) satisfies LayoutServerLoad;
