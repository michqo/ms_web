export function createTokenCookieOptions(isDevelopment: boolean) {
	return {
		path: '/',
		httpOnly: true,
		secure: !isDevelopment,
		sameSite: 'lax'
	} as const;
}
