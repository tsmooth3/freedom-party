import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { createHmac } from 'crypto';

function signToken(expiryStr: string, secret: string): string {
	return createHmac('sha256', secret).update(expiryStr).digest('hex');
}

export const load: PageServerLoad = async ({ locals }) => {
	// If already authenticated, redirect to dashboard
	if (locals.isAdmin) {
		throw redirect(303, '/admin/dashboard');
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');
		const adminPassword = env.ADMIN_PASSWORD || 'adminpass';

		if (password !== adminPassword) {
			return fail(400, { incorrect: true, message: 'Incorrect passphrase.' });
		}

		// 60 minutes expiry
		const maxAgeSeconds = 60 * 60;
		const expiry = Date.now() + maxAgeSeconds * 1000;
		const expiryStr = expiry.toString();
		const signature = signToken(expiryStr, adminPassword);
		const cookieValue = `${expiryStr}:${signature}`;

		cookies.set('admin_session', cookieValue, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: maxAgeSeconds
		});

		throw redirect(303, '/admin/dashboard');
	},
	logout: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/' });
		throw redirect(303, '/admin/login');
	}
};
