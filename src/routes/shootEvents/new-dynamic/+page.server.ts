import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication to create an event
	if (!locals.user) {
		throw redirect(303, '/admin/login?redirect=/shootEvents/new-dynamic');
	}

	return {
		user: locals.user
	};
};
