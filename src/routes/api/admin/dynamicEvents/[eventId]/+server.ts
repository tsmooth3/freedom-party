import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.isAdmin) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	const eventId = Number(params.eventId);
	if (isNaN(eventId)) {
		return json({ success: false, message: 'Invalid Event ID' }, { status: 400 });
	}

	try {
		// DynamicEvent → teams/rounds cascade; stations/scores cascade from those
		await prisma.dynamicEvent.delete({ where: { id: eventId } });
		return json({ success: true });
	} catch (error: any) {
		console.error(`Failed to delete dynamic event ${eventId}:`, error);
		return json(
			{ success: false, message: error.message || 'An error occurred during deletion.' },
			{ status: 500 }
		);
	}
};
