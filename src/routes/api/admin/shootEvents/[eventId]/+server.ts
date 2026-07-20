import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	// Guard against unauthorized API calls (in addition to hooks)
	if (!locals.isAdmin) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const eventId = Number(params.eventId);
	if (isNaN(eventId)) {
		return json({ success: false, message: 'Invalid Event ID' }, { status: 400 });
	}

	try {
		// Run cascade deletion in a database-level transaction
		await prisma.$transaction([
			// 1. Delete all RoundStation records matching this eventId
			prisma.roundStation.deleteMany({
				where: {
					eventId: eventId
				}
			}),
			// 2. Delete all EventRound records matching this eventId
			prisma.eventRound.deleteMany({
				where: {
					eventId: eventId
				}
			}),
			// 3. Delete all TeamScore records matching this eventId
			prisma.teamScore.deleteMany({
				where: {
					eventId: eventId
				}
			}),
			// 4. Finally, delete the parent ShootEvent
			prisma.shootEvent.delete({
				where: {
					id: eventId
				}
			})
		]);

		return json({ success: true });
	} catch (error: any) {
		console.error(`Failed to cascade delete shoot event ${eventId}:`, error);
		return json(
			{
				success: false,
				message: error.message || 'An error occurred during deletion.'
			},
			{ status: 500 }
		);
	}
};
