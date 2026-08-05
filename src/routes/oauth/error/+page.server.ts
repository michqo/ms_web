import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const reason = url.searchParams.get('reason');

	if (reason !== 'invalid_ticket' && reason !== 'provider_unavailable') {
		redirect(303, '/');
	}

	return { reason };
};
