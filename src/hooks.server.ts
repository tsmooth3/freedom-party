import { redirect, json, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createHmac } from 'crypto';

function signToken(expiryStr: string, secret: string): string {
	return createHmac('sha256', secret).update(expiryStr).digest('hex');
}

function verifyToken(cookieValue: string | undefined, secret: string): boolean {
	if (!cookieValue) return false;
	const parts = cookieValue.split(':');
	if (parts.length !== 2) return false;
	const [expiryStr, signature] = parts;
	const expiry = parseInt(expiryStr, 10);
	if (isNaN(expiry) || expiry < Date.now()) return false;
	const expectedSignature = signToken(expiryStr, secret);
	return signature === expectedSignature;
}

function verifyGoogleSession(cookieValue: string | undefined, secret: string) {
	if (!cookieValue) return null;
	const parts = cookieValue.split(':');
	if (parts.length !== 6) return null;
	const [userId, email, name, role, expiryStr, signature] = parts;
	const expiry = parseInt(expiryStr, 10);
	if (isNaN(expiry) || expiry < Date.now()) return null;

	const data = `${userId}:${email}:${name}:${role}:${expiryStr}`;
	const expectedSignature = createHmac('sha256', secret).update(data).digest('hex');

	if (signature !== expectedSignature) return null;

	return {
		id: parseInt(userId, 10),
		email,
		name,
		role: role as 'ADMIN' | 'SCORER' | 'SPECTATOR',
		authType: 'GOOGLE' as const
	};
}

export const handle: Handle = async ({ event, resolve }) => {
	const adminPassword = env.ADMIN_PASSWORD || 'adminpass';
	
	// 1. Check local admin session
	const adminSessionCookie = event.cookies.get('admin_session');
	const isLocalAdmin = verifyToken(adminSessionCookie, adminPassword);

	// 2. Check Google session
	const googleSessionCookie = event.cookies.get('google_session');
	const googleUser = verifyGoogleSession(googleSessionCookie, adminPassword);

	// 3. Populate locals
	if (isLocalAdmin) {
		event.locals.isAdmin = true;
		event.locals.user = {
			name: 'Local Admin',
			role: 'ADMIN',
			authType: 'LOCAL'
		};
	} else if (googleUser) {
		event.locals.isAdmin = googleUser.role === 'ADMIN';
		event.locals.user = googleUser;
	} else {
		event.locals.isAdmin = false;
		event.locals.user = null;
	}

	const { pathname } = event.url;

	// Protect Admin Pages (except /admin/login)
	if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
		if (!event.locals.isAdmin) {
			throw redirect(303, '/admin/login');
		}
	}

	// Protect Admin API Routes
	if (pathname.startsWith('/api/admin')) {
		if (!event.locals.isAdmin) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
	}

	return resolve(event);
};
