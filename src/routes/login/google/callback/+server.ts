import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import prisma from '$lib/server/prisma';
import { createHmac } from 'crypto';

function signSession(userId: number, email: string, name: string, role: string, expiry: number, secret: string): string {
	const data = `${userId}:${email}:${name}:${role}:${expiry}`;
	return createHmac('sha256', secret).update(data).digest('hex');
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const savedState = cookies.get('oauth_state');

	// Clear the state cookie
	cookies.delete('oauth_state', { path: '/' });

	if (!code || !state || state !== savedState) {
		throw error(400, 'Invalid request or state mismatch. Please try signing in again.');
	}

	const clientId = env.GOOGLE_CLIENT_ID;
	const clientSecret = env.GOOGLE_CLIENT_SECRET;
	const redirectUri = env.GOOGLE_REDIRECT_URI || `${url.origin}/login/google/callback`;
	const adminPassword = env.ADMIN_PASSWORD || 'adminpass';

	if (!clientId || !clientSecret) {
		console.error('Google OAuth credentials not configured.');
		throw redirect(303, '/admin/login?error=oauth_misconfigured');
	}

	try {
		// 1. Exchange Auth Code for Tokens
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code'
			})
		});

		if (!tokenResponse.ok) {
			const errBody = await tokenResponse.text();
			console.error('Failed to exchange authorization code:', errBody);
			throw error(500, 'Failed to authenticate with Google.');
		}

		const tokens = await tokenResponse.json();
		const accessToken = tokens.access_token;

		// 2. Fetch User Profile Info from Google
		const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: { Authorization: `Bearer ${accessToken}` }
		});

		if (!profileResponse.ok) {
			throw error(500, 'Failed to fetch user profile from Google.');
		}

		const profile = await profileResponse.json();
		const email = profile.email;
		const name = profile.name || profile.given_name || 'Google User';

		if (!email) {
			throw error(400, 'Google did not return an email address.');
		}

		// 3. Upsert User in database, defaulting system role to SPECTATOR
		const user = await prisma.user.upsert({
			where: { email },
			update: { name },
			create: {
				email,
				name,
				role: 'SPECTATOR' // default role is SPECTATOR
			}
		});

		// 4. Set Secure Session Cookie (7 days expiry)
		const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days
		const expiry = Date.now() + maxAgeSeconds * 1000;
		const signature = signSession(user.id, user.email, user.name || '', user.role, expiry, adminPassword);
		const cookieValue = `${user.id}:${user.email}:${user.name || ''}:${user.role}:${expiry}:${signature}`;

		cookies.set('google_session', cookieValue, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: maxAgeSeconds
		});

		const redirectTo = cookies.get('oauth_redirect') || '/clays';
		cookies.delete('oauth_redirect', { path: '/' });

		throw redirect(303, redirectTo); // redirect scorers/spectators to standard clays screen or the original redirect URL
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Error in Google OAuth Callback:', err);
		throw error(500, 'An unexpected error occurred during login.');
	}
};
