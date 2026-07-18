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

export const handle: Handle = async ({ event, resolve }) => {
	const adminPassword = env.ADMIN_PASSWORD || 'adminpass';
	const sessionCookie = event.cookies.get('admin_session');

	const isAuthorized = verifyToken(sessionCookie, adminPassword);
	event.locals.isAdmin = isAuthorized;

	const { pathname } = event.url;

	// Protect Admin Pages (except /admin/login)
	if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
		if (!isAuthorized) {
			throw redirect(303, '/admin/login');
		}
	}

	// Protect Admin API Routes
	if (pathname.startsWith('/api/admin')) {
		if (!isAuthorized) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
	}

	return resolve(event);
};
