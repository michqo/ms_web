import { api } from '@/shared';
import { deleteSchema } from '@/shared/schemas';
import { redirect, type Actions } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const actions = {
	logout: async ({cookies}) => {
		cookies.delete('access_token', { path: '/' });
		cookies.delete('refresh_token', { path: '/' });
		redirect(308, '/auth');
	},
	delete: async (event) => {
		const form = await superValidate(event, zod(deleteSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			api.setAuthToken(event.locals.accessToken!);
			await api.deleteAccount(form.data);

			const { cookies } = event;
			cookies.delete('access_token', { path: '/' });
			cookies.delete('refresh_token', { path: '/' });
			redirect(308, '/auth?for=login');
		} catch {
			return fail(401, {
        form
      });
		}
	}
} satisfies Actions;
