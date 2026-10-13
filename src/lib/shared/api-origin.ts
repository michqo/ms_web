// The production API is the Fly app configured in the sibling ms_api/fly.toml.
export const PRODUCTION_API_ORIGIN = 'https://meteostanica.fly.dev';

export function resolveApiOrigin(value: string | undefined, development: boolean): string {
	const configured =
		value?.trim() || (development ? 'http://localhost:8000' : PRODUCTION_API_ORIGIN);
	let url: URL;
	try {
		url = new URL(configured);
	} catch {
		throw new Error('PUBLIC_API_URL must be an absolute API origin.');
	}
	if (
		!['http:', 'https:'].includes(url.protocol) ||
		url.username ||
		url.password ||
		url.pathname !== '/' ||
		url.search ||
		url.hash
	) {
		throw new Error(
			'PUBLIC_API_URL must be an HTTP(S) origin without credentials, a path or query.'
		);
	}
	const loopback =
		['localhost', '[::1]', '[::]', '0.0.0.0'].includes(url.hostname) ||
		url.hostname.endsWith('.localhost') ||
		url.hostname.startsWith('127.');
	if (!development && (url.protocol !== 'https:' || loopback)) {
		throw new Error('Production PUBLIC_API_URL must use HTTPS and a publicly reachable API host.');
	}
	return url.origin;
}
