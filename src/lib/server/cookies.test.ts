import { describe, expect, it } from 'vitest';
import { createTokenCookieOptions } from './cookie-options';

describe('createTokenCookieOptions', () => {
	it('allows token cookies over HTTP during development', () => {
		expect(createTokenCookieOptions(true)).toEqual({
			path: '/',
			httpOnly: true,
			secure: false,
			sameSite: 'lax'
		});
	});

	it('requires secure token cookies in production', () => {
		expect(createTokenCookieOptions(false)).toEqual({
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});
	});
});
