import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer, loadEnv } from 'vite';

const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const apiUrl = new URL(env.PUBLIC_API_URL || 'http://localhost:8000');
const frontendOrigin = 'http://localhost:5174';
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
let apiProcess;
let vite;
let closing = false;

async function probe() {
	try {
		return await fetch(new URL('/api/stations/', apiUrl), {
			headers: { Origin: frontendOrigin },
			signal: AbortSignal.timeout(1500)
		});
	} catch {
		return null;
	}
}

async function close(code = 0) {
	if (closing) return;
	closing = true;
	await vite?.close();
	if (apiProcess?.pid && apiProcess.exitCode === null) {
		// The Django reloader is a grandchild. Stop only the process group we created.
		if (process.platform === 'win32') apiProcess.kill('SIGTERM');
		else process.kill(-apiProcess.pid, 'SIGTERM');
	}
	process.exitCode = code;
}

process.on('SIGINT', () => void close());
process.on('SIGTERM', () => void close());

try {
	if (localHosts.has(apiUrl.hostname) && apiUrl.protocol === 'http:') {
		let response = await probe();
		if (!response) {
			const apiDir = resolve(env.MS_API_DIR || '../ms_api');
			if (!existsSync(resolve(apiDir, 'manage.py'))) {
				throw new Error(
					`Django was not found at ${apiDir}. Set MS_API_DIR or use pnpm dev:frontend.`
				);
			}
			console.info(`Starting local Django API at ${apiUrl.origin}…`);
			apiProcess = spawn(
				'poetry',
				['run', 'python', 'manage.py', 'runserver', `${apiUrl.hostname}:${apiUrl.port || 80}`],
				{
					cwd: apiDir,
					stdio: 'inherit',
					detached: process.platform !== 'win32',
					env: {
						...process.env,
						OAUTH_FRONTEND_ORIGIN: frontendOrigin,
						OAUTH_FRONTEND_CALLBACK: `${frontendOrigin}/oauth/callback`,
						OAUTH_FRONTEND_ERROR_URL: `${frontendOrigin}/oauth/error`
					}
				}
			);
			apiProcess.on('error', (error) => {
				console.error(`Could not start Poetry: ${error.message}`);
				void close(1);
			});
			apiProcess.on('exit', (code) => {
				if (!closing) {
					console.error('Django stopped. Check its output above and the API setup in README.md.');
					void close(code || 1);
				}
			});
			const deadline = Date.now() + 20_000;
			while (!response && !closing && Date.now() < deadline) {
				await new Promise((done) => setTimeout(done, 250));
				response = await probe();
			}
		}
		if (closing) throw new Error('Local API startup failed.');
		if (!response?.ok)
			throw new Error('Local API is not ready. Check PostgreSQL, migrations and the API output.');
		if (response.headers.get('access-control-allow-origin') !== frontendOrigin) {
			throw new Error(
				`The API already running at ${apiUrl.origin} does not allow ${frontendOrigin}. ` +
					'Stop that API and rerun pnpm dev, or set its OAUTH_FRONTEND_ORIGIN, CALLBACK and ERROR_URL to port 5174.'
			);
		}
		console.info('Local API ready; browser CORS origin verified.');
	}
	vite = await createServer();
	await vite.listen();
	vite.printUrls();
} catch (error) {
	console.error(error.message);
	await close(1);
}
