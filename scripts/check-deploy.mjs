import { loadEnv } from 'vite';
import { resolveApiOrigin } from '../src/lib/shared/api-origin.ts';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
try {
	resolveApiOrigin(env.PUBLIC_API_URL, false);
	console.info('Production API origin validated.');
} catch (error) {
	console.error(error.message);
	process.exitCode = 1;
}
