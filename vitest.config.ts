import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		resolve: {
			conditions: ['browser']
		},
		test: {
			alias: {
				'__sveltekit/environment': new URL('./tests/sveltekit/environment.ts', import.meta.url)
					.pathname,
				'__sveltekit/paths': new URL('./tests/sveltekit/paths.ts', import.meta.url).pathname
			},
			server: {
				deps: {
					inline: ['@sveltejs/kit', 'sveltekit-superforms']
				}
			}
		}
	})
);
