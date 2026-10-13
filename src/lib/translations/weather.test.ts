import { expect, it } from 'vitest';
import en from './en/weather.json';
import sk from './sk/weather.json';

it('provides the complete weather vocabulary in English and Slovak', () => {
	expect(Object.keys(sk).sort()).toEqual(Object.keys(en).sort());
	for (const value of Object.values(sk)) expect(value.trim()).not.toBe('');
});
