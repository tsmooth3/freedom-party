import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { canManageEventScorers, publicUserLabel } from '$lib/server/eventAuth';
import type { RequestHandler } from './$types';

function mapScorer(row: {
	userId: number;
	user: { id: number; name: string | null; email: string };
}) {
	return {
		id: row.user.id,
		name: row.user.name,
		email: row.user.email,
		label: publicUserLabel(row.user)
	};
}

/** GET — list creator + granted scorers (any signed-in user can read). */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
	}

	const eventId = Number(params.eventId);
	if (!Number.isFinite(eventId)) {
		return json({ success: false, message: 'Invalid event id.' }, { status: 400 });
	}

	const event = await prisma.dynamicEvent.findUnique({
		where: { id: eventId },
		include: {
			creator: { select: { id: true, name: true, email: true } },
			scorers: {
				include: { user: { select: { id: true, name: true, email: true } } },
				orderBy: { createdAt: 'asc' }
			}
		}
	});

	if (!event) {
		return json({ success: false, message: 'Event not found.' }, { status: 404 });
	}

	return json({
		success: true,
		canManage: canManageEventScorers(locals.user, event),
		creator: event.creator
			? {
					id: event.creator.id,
					name: event.creator.name,
					email: event.creator.email,
					label: publicUserLabel(event.creator)
				}
			: null,
		scorers: event.scorers.map(mapScorer)
	});
};

/**
 * PUT — replace the full grant list (creator or admin).
 * Body: { userIds: number[] }
 * Creator is never stored as a scorer grant (implicit permission).
 */
export const PUT: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) {
		return json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
	}

	const eventId = Number(params.eventId);
	if (!Number.isFinite(eventId)) {
		return json({ success: false, message: 'Invalid event id.' }, { status: 400 });
	}

	const event = await prisma.dynamicEvent.findUnique({
		where: { id: eventId },
		select: { id: true, creatorId: true }
	});
	if (!event) {
		return json({ success: false, message: 'Event not found.' }, { status: 404 });
	}

	if (!canManageEventScorers(locals.user, event)) {
		return json(
			{ success: false, message: 'Only the event creator or an admin can manage scorers.' },
			{ status: 403 }
		);
	}

	let body: { userIds?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
	}

	const rawIds = Array.isArray(body.userIds) ? body.userIds : null;
	if (!rawIds) {
		return json({ success: false, message: 'userIds must be an array of user ids.' }, { status: 400 });
	}

	const uniqueIds = [
		...new Set(
			rawIds
				.map((id) => Number(id))
				.filter((id) => Number.isFinite(id) && id > 0)
		)
	].filter((id) => id !== event.creatorId);

	if (uniqueIds.length > 0) {
		const found = await prisma.user.findMany({
			where: { id: { in: uniqueIds } },
			select: { id: true }
		});
		if (found.length !== uniqueIds.length) {
			return json(
				{ success: false, message: 'One or more user ids were not found.' },
				{ status: 400 }
			);
		}
	}

	await prisma.$transaction(async (tx) => {
		await tx.dynamicEventScorer.deleteMany({ where: { eventId } });
		if (uniqueIds.length > 0) {
			await tx.dynamicEventScorer.createMany({
				data: uniqueIds.map((userId) => ({ eventId, userId }))
			});
		}
	});

	const scorers = await prisma.dynamicEventScorer.findMany({
		where: { eventId },
		include: { user: { select: { id: true, name: true, email: true } } },
		orderBy: { createdAt: 'asc' }
	});

	return json({
		success: true,
		scorers: scorers.map(mapScorer)
	});
};
