import { deleteSchema } from '@/shared/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return {
		...locals,
		form: await superValidate(zod(deleteSchema))
	};
}) satisfies LayoutServerLoad;
