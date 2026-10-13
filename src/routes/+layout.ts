import { addTranslations, setLocale, setRoute } from '@/translations';
import type { LayoutLoad } from './$types';
export const load: LayoutLoad = async ({ data }) => {
	const { locale, route } = data.i18n;
	addTranslations(data.translations);
	await setLocale(locale);
	await setRoute(route);
	return { ...data, locale, route };
};
