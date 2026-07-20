import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectTo = url.searchParams.get('redirectTo') || '/clays';
	if (locals.user) {
		throw redirect(303, redirectTo);
	}
	return {};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/' });
		cookies.delete('google_session', { path: '/' });
		throw redirect(303, '/login');
	}
};
