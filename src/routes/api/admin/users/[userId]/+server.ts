import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

const ROLES = new Set(['SPECTATOR', 'SCORER', 'ADMIN']);

function actingUserId(locals: App.Locals): number | null {
	if (locals.user?.authType === 'GOOGLE' && typeof locals.user.id === 'number') {
		return locals.user.id;
	}
	return null;
}

async function adminCount(): Promise<number> {
	return prisma.user.count({ where: { role: 'ADMIN' } });
}

/** PATCH — change role */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.isAdmin) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const userId = Number(params.userId);
	if (isNaN(userId)) {
		return json({ success: false, message: 'Invalid User ID' }, { status: 400 });
	}

	const body = await request.json().catch(() => ({}));
	const role = String(body.role || '').toUpperCase();
	if (!ROLES.has(role)) {
		return json({ success: false, message: 'Invalid role.' }, { status: 400 });
	}

	const selfId = actingUserId(locals);
	if (selfId !== null && selfId === userId) {
		return json({ success: false, message: 'You cannot change your own role.' }, { status: 400 });
	}

	const target = await prisma.user.findUnique({ where: { id: userId } });
	if (!target) {
		return json({ success: false, message: 'User not found.' }, { status: 404 });
	}

	if (target.role === 'ADMIN' && role !== 'ADMIN') {
		const admins = await adminCount();
		if (admins <= 1) {
			return json(
				{ success: false, message: 'Cannot demote the last remaining ADMIN.' },
				{ status: 400 }
			);
		}
	}

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { role }
	});

	return json({
		success: true,
		user: {
			id: updated.id,
			email: updated.email,
			name: updated.name,
			role: updated.role
		}
	});
};

/**
 * DELETE — remove user.
 * Body: { reassignToUserId: number | null }
 *   - number → move their dynamic events to that user
 *   - null   → unassign (creatorId = null)
 */
export const DELETE: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.isAdmin) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const userId = Number(params.userId);
	if (isNaN(userId)) {
		return json({ success: false, message: 'Invalid User ID' }, { status: 400 });
	}

	const selfId = actingUserId(locals);
	if (selfId !== null && selfId === userId) {
		return json({ success: false, message: 'You cannot delete your own account.' }, { status: 400 });
	}

	const target = await prisma.user.findUnique({
		where: { id: userId },
		include: { _count: { select: { createdEvents: true } } }
	});
	if (!target) {
		return json({ success: false, message: 'User not found.' }, { status: 404 });
	}

	if (target.role === 'ADMIN') {
		const admins = await adminCount();
		if (admins <= 1) {
			return json(
				{ success: false, message: 'Cannot delete the last remaining ADMIN.' },
				{ status: 400 }
			);
		}
	}

	const body = await request.json().catch(() => ({}));
	const hasKey = Object.prototype.hasOwnProperty.call(body, 'reassignToUserId');
	if (!hasKey) {
		return json(
			{
				success: false,
				message: 'reassignToUserId is required (user id to transfer events to, or null to unassign).'
			},
			{ status: 400 }
		);
	}

	const reassignRaw = body.reassignToUserId;
	let reassignToUserId: number | null = null;
	if (reassignRaw !== null && reassignRaw !== undefined && reassignRaw !== '') {
		reassignToUserId = Number(reassignRaw);
		if (isNaN(reassignToUserId)) {
			return json({ success: false, message: 'Invalid reassignToUserId.' }, { status: 400 });
		}
		if (reassignToUserId === userId) {
			return json(
				{ success: false, message: 'Cannot reassign events to the user being deleted.' },
				{ status: 400 }
			);
		}
		const dest = await prisma.user.findUnique({ where: { id: reassignToUserId } });
		if (!dest) {
			return json({ success: false, message: 'Reassignment target user not found.' }, { status: 400 });
		}
	}

	try {
		await prisma.$transaction([
			prisma.dynamicEvent.updateMany({
				where: { creatorId: userId },
				data: { creatorId: reassignToUserId }
			}),
			prisma.user.delete({ where: { id: userId } })
		]);
		return json({ success: true });
	} catch (error: any) {
		console.error(`Failed to delete user ${userId}:`, error);
		return json(
			{ success: false, message: error.message || 'An error occurred during deletion.' },
			{ status: 500 }
		);
	}
};
