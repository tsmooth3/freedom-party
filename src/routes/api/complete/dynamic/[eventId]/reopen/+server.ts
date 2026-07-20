import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

/** Re-open a COMPLETE DynamicEvent for score edits (→ ACTIVE). */
export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
	}

	const eventId = Number(params.eventId);
	if (!Number.isFinite(eventId)) {
		return json({ success: false, message: 'Invalid event id.' }, { status: 400 });
	}

	try {
		const event = await prisma.dynamicEvent.findUnique({ where: { id: eventId } });
		if (!event) {
			return json({ success: false, message: 'Dynamic event not found.' }, { status: 404 });
		}

		const isCreator = event.creatorId !== null && event.creatorId === locals.user.id;
		const isAdmin = locals.user.role === 'ADMIN';
		if (!isAdmin && !isCreator) {
			return json({ success: false, message: 'Unauthorized to unlock this event.' }, { status: 403 });
		}

		if (event.eventState !== 'COMPLETE') {
			return json({ success: true, eventState: event.eventState, message: 'Event is already open.' });
		}

		await prisma.$transaction([
			prisma.dynamicEvent.update({
				where: { id: eventId },
				data: { eventState: 'ACTIVE' }
			}),
			prisma.dynamicRound.updateMany({
				where: { eventId },
				data: { roundState: 'ACTIVE' }
			})
		]);

		return json({ success: true, eventState: 'ACTIVE' });
	} catch (error: any) {
		console.error('Failed to reopen dynamic event:', error);
		return json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
	}
};
