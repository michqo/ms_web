import { api, authApi } from '@/shared';
import { deleteSchema, loginSchema } from '@/shared/schemas';
import type { PostUserErrorResponse } from '@/shared/types';
import { error, redirect, type Actions } from '@sveltejs/kit';
import { isAxiosError } from 'axios';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('access_token', { path: '/' });
		cookies.delete('refresh_token', { path: '/' });
		// redirect(308, '/');
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
			redirect(308, '/');
		} catch {
			return fail(401, {
				form
			});
		}
	},
	auth: async (event) => {
		const form = await superValidate(event, zod(loginSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { cookies } = event;
		switch (form.id) {
			case 'login':
				try {
					const res = await authApi.createJwt(form.data);
					cookies.set('access_token', res.access, { path: '/' });
					cookies.set('refresh_token', res.refresh, { path: '/' });
				} catch {
					error(401);
				}
				break;
			case 'register':
				try {
					await authApi.postUser(form.data);
				} catch (error) {
					if (isAxiosError(error)) {
						const e = error.response?.data as PostUserErrorResponse;
						if (e.username) {
							setError(form, 'username', e.username);
						}
						if (e.password) {
							setError(form, 'password', e.password);
						}
					}
				}
				break;
			default:
				break;
		}

		return {
			form
		};
	}
} satisfies Actions;
