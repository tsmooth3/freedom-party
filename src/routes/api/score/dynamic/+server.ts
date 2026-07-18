import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
	}

	try {
		const { teamId, stationLayoutId, claysHit } = await request.json();

		if (teamId === undefined || stationLayoutId === undefined || claysHit === undefined) {
			return json({ success: false, message: 'Missing score parameters.' }, { status: 400 });
		}

		// 1. Fetch event to verify ownership/privilege
		const station = await prisma.stationLayout.findUnique({
			where: { id: Number(stationLayoutId) },
			include: {
				round: {
					include: {
						event: true
					}
				}
			}
		});

		if (!station) {
			return json({ success: false, message: 'Station layout not found.' }, { status: 404 });
		}

		const event = station.round.event;
		const isCreator = event.creatorId !== null && event.creatorId === locals.user.id;
		const isAdmin = locals.user.role === 'ADMIN';

		// Authorize: Only admin or event creator can score
		if (!isAdmin && !isCreator) {
			return json({ success: false, message: 'Unauthorized to score this event.' }, { status: 403 });
		}

		// 2. Upsert the TeamStationScore
		const updatedScore = await prisma.teamStationScore.upsert({
			where: {
				teamId_stationLayoutId: {
					teamId: Number(teamId),
					stationLayoutId: Number(stationLayoutId)
				}
			},
			update: {
				claysHit: Number(claysHit),
				isComplete: true
			},
			create: {
				teamId: Number(teamId),
				stationLayoutId: Number(stationLayoutId),
				claysHit: Number(claysHit),
				shotsFired: 4,
				isComplete: true
			}
		});

		return json({ success: true, score: updatedScore });
	} catch (error: any) {
		console.error('Failed to update dynamic score:', error);
		return json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
	}
};
