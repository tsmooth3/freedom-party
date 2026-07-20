import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const clientId = env.GOOGLE_CLIENT_ID;
	const redirectUri = env.GOOGLE_REDIRECT_URI || `${url.origin}/login/google/callback`;

	if (!clientId) {
		console.error('GOOGLE_CLIENT_ID is not configured in private environment variables.');
		throw redirect(303, '/admin/login?error=oauth_misconfigured');
	}

	const state = Math.random().toString(36).substring(2, 15);
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
	});

	const redirectTo = url.searchParams.get('redirectTo');
	if (redirectTo) {
		cookies.set('oauth_redirect', redirectTo, {
			path: '/',
			httpOnly: true,
			maxAge: 60 * 10, // 10 minutes
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax'
		});
	}

	const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
		new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			response_type: 'code',
			scope: 'openid email profile',
			state: state,
			access_type: 'online'
		}).toString();

	throw redirect(302, googleAuthUrl);
};
