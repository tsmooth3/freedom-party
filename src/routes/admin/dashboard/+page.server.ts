import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	// hooks.server.ts handles security/redirection, but safe check:
	if (!locals.isAdmin) {
		return { shootEvents: [] };
	}

	const shootEvents = await prisma.shootEvent.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			_count: {
				select: {
					eventFormat: true, // number of rounds
					eventTeamScores: true // number of teams
				}
			}
		}
	});

	return {
		shootEvents: shootEvents.map(event => ({
			id: event.id,
			eventName: event.eventName,
			eventState: event.eventState,
			createdAt: event.createdAt.toISOString(),
			roundsCount: event._count.eventFormat,
			teamsCount: event._count.eventTeamScores
		}))
	};
};
