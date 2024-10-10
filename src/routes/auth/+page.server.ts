import { loginSchema } from '@/shared/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {
		form: await superValidate(zod(loginSchema))
	};
}) satisfies PageServerLoad;
