import type { PageServerLoad } from "./$types";
import type { prismaShootEvent } from "$lib/shared/utils";
import type { Actions } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";

export const load: PageServerLoad = async ({ fetch, locals }) => {
	// 1. Fetch active legacy shoot events for backward compatibility
	const dbShootEventResponse = await fetch('/api/shootEvents/byLeader');
	const dbShootEvents: prismaShootEvent[] = await dbShootEventResponse.json();

	// 2. Fetch active dynamic shoot events
	const activeDynamicEvents = await prisma.dynamicEvent.findMany({
		where: {
			eventState: { not: 'COMPLETE' }
		},
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			teams: {
				orderBy: {
					id: 'asc'
				}
			},
			rounds: {
				orderBy: {
					roundIndex: 'asc'
				},
				include: {
					stations: {
						orderBy: {
							stationIndex: 'asc'
						}
					}
				}
			}
		}
	});

	return {
		dbShootEvents,
		dynamicEvents: activeDynamicEvents.map(event => ({
			id: event.id,
			eventName: event.eventName,
			eventState: event.eventState,
			teams: event.teams.map(t => ({
				id: t.id,
				teamName: t.teamName,
				shooter1: t.shooter1,
				shooter2: t.shooter2
			})),
			round: event.rounds[0] ? {
				id: event.rounds[0].id,
				roundName: event.rounds[0].roundName,
				roundIndex: event.rounds[0].roundIndex,
				stations: event.rounds[0].stations.map(st => ({
					id: st.id,
					stationIndex: st.stationIndex,
					launchType: st.launchType,
					sequence: st.sequence,
					totalClays: st.totalClays
				}))
			} : null
		})),
		user: locals.user
	};
};

export const actions: Actions = {
	deleteEvent: async ({ fetch, request }) => {
		const formData = await request.formData();
		const eventId = Number(formData.get('eventId'));
		await fetch('/api/shootEvents?eventId=' + eventId, { 'method': 'DELETE' });
		return { success: true };
	}
};
