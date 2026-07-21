import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { canScoreDynamicEvent } from '$lib/server/eventAuth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
	}

	try {
		const { teamId, stationLayoutId, claysHit, presentationIndex, currentTeamIndex, currentStationIndex, currentPresentationIndex } = await request.json();

		// We can use this endpoint to either update scores + status, or just status/indexes
		if (stationLayoutId === undefined) {
			return json({ success: false, message: 'Missing station parameter.' }, { status: 400 });
		}

		// 1. Fetch event to verify ownership/privilege
		const station = await prisma.stationLayout.findUnique({
			where: { id: Number(stationLayoutId) },
			include: {
				round: {
					include: {
						event: {
							include: {
								scorers: { select: { userId: true } }
							}
						}
					}
				}
			}
		});

		if (!station) {
			return json({ success: false, message: 'Station layout not found.' }, { status: 404 });
		}

		const event = station.round.event;

		// Authorize: admin, event creator, or granted scorer
		if (!canScoreDynamicEvent(locals.user, event)) {
			return json({ success: false, message: 'Unauthorized to score this event.' }, { status: 403 });
		}

		// 2. Upsert the TeamStationScore if score values are passed
		let updatedScore = null;
		if (teamId !== undefined && claysHit !== undefined) {
			updatedScore = await prisma.teamStationScore.upsert({
				where: {
					teamId_stationLayoutId_presentationIndex: {
						teamId: Number(teamId),
						stationLayoutId: Number(stationLayoutId),
						presentationIndex: Number(presentationIndex || 1)
					}
				},
				update: {
					claysHit: Number(claysHit),
					isComplete: true
				},
				create: {
					teamId: Number(teamId),
					stationLayoutId: Number(stationLayoutId),
					presentationIndex: Number(presentationIndex || 1),
					claysHit: Number(claysHit),
					shotsFired: 4,
					isComplete: true
				}
			});
		}

		// 3. Update the event tracking state and transition to ACTIVE if still in SETUP
		const nextState = event.eventState === 'SETUP' ? 'ACTIVE' : event.eventState;
		await prisma.dynamicEvent.update({
			where: { id: event.id },
			data: {
				eventState: nextState,
				currentTeamIndex: Number(currentTeamIndex !== undefined ? currentTeamIndex : event.currentTeamIndex),
				currentStationIndex: Number(currentStationIndex !== undefined ? currentStationIndex : event.currentStationIndex),
				currentPresentationIndex: Number(currentPresentationIndex !== undefined ? currentPresentationIndex : event.currentPresentationIndex)
			}
		});

		return json({ success: true, score: updatedScore });
	} catch (error: any) {
		console.error('Failed to update dynamic score:', error);
		return json({ success: false, message: error.message || 'Server error.' }, { status: 500 });
	}
};
