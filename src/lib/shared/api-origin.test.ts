import { describe, expect, it } from 'vitest';
import { PRODUCTION_API_ORIGIN, resolveApiOrigin } from './api-origin';

describe('deployment API origin', () => {
	it('uses the local API only in development and the Fly API in production', () => {
		expect(resolveApiOrigin(undefined, true)).toBe('http://localhost:8000');
		expect(resolveApiOrigin(undefined, false)).toBe(PRODUCTION_API_ORIGIN);
	});
	it('preserves a configured HTTPS origin and normalizes the root slash', () => {
		expect(resolveApiOrigin(' https://weather.example.com/ ', false)).toBe(
			'https://weather.example.com'
		);
	});
	it.each([
		'http://localhost:8000',
		'https://localhost:8000',
		'https://127.0.0.1',
		'https://[::1]',
		'https://weather.localhost',
		'http://weather.example.com'
	])('rejects a local or insecure production origin: %s', (value) => {
		expect(() => resolveApiOrigin(value, false)).toThrow('Production PUBLIC_API_URL');
	});
	it.each([
		'/api',
		'not-a-url',
		'https://weather.example.com/api',
		'https://weather.example.com?token=not-a-secret',
		'https://weather.example.com#section',
		'https://user:password@weather.example.com',
		'file:///tmp/weather'
	])('rejects an invalid API base in either environment: %s', (value) => {
		for (const development of [true, false]) {
			expect(() => resolveApiOrigin(value, development)).toThrow('PUBLIC_API_URL');
		}
	});
});
