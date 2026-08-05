import { api, authApi } from '@/shared';
import { deleteSchema, loginSchema } from '@/shared/schemas';
import type { PostUserErrorResponse } from '@/shared/types';
import { TOKEN_COOKIE_OPTIONS } from '$lib/server/cookies';
import { redirect, type Actions } from '@sveltejs/kit';
import { isAxiosError } from 'axios';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('access_token', TOKEN_COOKIE_OPTIONS);
		cookies.delete('refresh_token', TOKEN_COOKIE_OPTIONS);
		redirect(308, '/');
	},
	delete: async (event) => {
		const form = await superValidate(event, zod(deleteSchema));
		const isOAuthUser = !event.locals.user?.has_usable_password;

		if (!isOAuthUser && !form.valid) {
			return fail(400, { form });
		}

		try {
			api.setAuthToken(event.locals.accessToken!);
			await api.deleteAccount(form.data);

			const { cookies } = event;
			cookies.delete('access_token', TOKEN_COOKIE_OPTIONS);
			cookies.delete('refresh_token', TOKEN_COOKIE_OPTIONS);
			redirect(308, '/');
		} catch {
			return fail(401, { form });
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
					cookies.set('access_token', res.access, TOKEN_COOKIE_OPTIONS);
					cookies.set('refresh_token', res.refresh, TOKEN_COOKIE_OPTIONS);
				} catch {
					return fail(401, { form, message: 'Invalid credentials' });
				}
				break;
			case 'register':
				try {
					await authApi.postUser(form.data);
					const res = await authApi.createJwt(form.data);
					cookies.set('access_token', res.access, TOKEN_COOKIE_OPTIONS);
					cookies.set('refresh_token', res.refresh, TOKEN_COOKIE_OPTIONS);
				} catch (e) {
					if (isAxiosError(e)) {
						const err = e.response?.data as PostUserErrorResponse;
						if (err.username) {
							setError(form, 'username', err.username);
						}
						if (err.password) {
							setError(form, 'password', err.password);
						}
					} else {
						setError(form, '', 'Registration failed. Please try again.');
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
