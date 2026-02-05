import i18n, { type Config } from 'sveltekit-i18n';
import { dev } from '$app/environment';
import lang from './lang.json';

export const defaultLocale = 'en';

export const config: Config = {
	log: {
		level: dev ? 'warn' : 'error'
	},
	translations: {
		en: { lang },
		cs: { lang }
	},
	loaders: [
		{
			locale: 'en',
			key: 'menu',
			loader: async () => (await import('./en/menu.json')).default
		},
		{
			locale: 'en',
			key: 'auth',
			loader: async () => (await import('./en/auth.json')).default
		},
		{
			locale: 'en',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./en/home.json')).default
		},
		{
			locale: 'en',
			key: 'dash',
			routes: ['/dash'],
			loader: async () => (await import('./en/dash.json')).default
		},
		{
			locale: 'en',
			key: 'measurements',
			routes: ['/measurements', '/dash'],
			loader: async () => (await import('./en/measurements.json')).default
		},
		{
			locale: 'en',
			key: 'forecast',
			routes: ['/forecast', '/dash'],
			loader: async () => (await import('./en/forecast.json')).default
		},
		{
			locale: 'sk',
			key: 'menu',
			loader: async () => (await import('./sk/menu.json')).default
		},
		{
			locale: 'sk',
			key: 'auth',
			loader: async () => (await import('./sk/auth.json')).default
		},
		{
			locale: 'sk',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./sk/home.json')).default
		},
		{
			locale: 'sk',
			key: 'dash',
			routes: ['/dash'],
			loader: async () => (await import('./sk/dash.json')).default
		},
		{
			locale: 'sk',
			key: 'measurements',
			routes: ['/measurements', '/dash'],
			loader: async () => (await import('./sk/measurements.json')).default
		},
		{
			locale: 'sk',
			key: 'forecast',
			routes: ['/forecast', '/dash'],
			loader: async () => (await import('./sk/forecast.json')).default
		}
	]
};

export const {
	t,
	loading,
	locales,
	locale,
	translations,
	loadTranslations,
	addTranslations,
	setLocale,
	setRoute
} = new i18n(config);
