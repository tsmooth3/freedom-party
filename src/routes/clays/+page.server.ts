import type { PageServerLoad } from "./$types";
import type { prismaShootEvent } from "$lib/shared/utils";
import type { Actions } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals }) => {
	// 1. Fetch active legacy shoot events for backward compatibility (direct DB query instead of HTTP fetch to avoid SvelteKit warnings)
	const dbShootEvents = await prisma.shootEvent.findMany({
		orderBy: {
			id: 'desc'
		},
		include: {
			eventTeamScores: {
				orderBy: [
					{ teamTotal: 'desc' },
					{ teamShotsFired: 'asc' }
				],
				include: {
					teamScores: {
						orderBy: {
							roundIndex: 'asc'
						}
					}
				}
			}
		}
	}) as any;

	// 2. Fetch all dynamic shoot events
	const activeDynamicEvents = await prisma.dynamicEvent.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			teams: {
				orderBy: {
					id: 'asc'
				},
				include: {
					stationScores: true
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
		dynamicEvents: activeDynamicEvents.map(event => {
			const stations = event.rounds[0]?.stations ?? [];
			const maxPossible = stations.reduce((sum, st) => sum + st.totalClays * 3, 0);

			const teams = event.teams.map(t => {
				const totalHit = t.stationScores.reduce((sum, ss) => sum + (ss.claysHit || 0), 0);
				return {
					id: t.id,
					teamName: t.teamName,
					shooter1: t.shooter1,
					shooter2: t.shooter2,
					totalHit,
					stationScores: t.stationScores.map(ss => ({
						stationLayoutId: ss.stationLayoutId,
						presentationIndex: ss.presentationIndex,
						claysHit: ss.claysHit,
						isComplete: ss.isComplete
					}))
				};
			});

			// Highest total wins; ties keep original team order
			const ranked = [...teams].sort((a, b) => b.totalHit - a.totalHit);
			const podium = ranked.slice(0, 3).map((t, i) => ({
				place: i + 1,
				teamName: t.teamName,
				shooter1: t.shooter1,
				shooter2: t.shooter2,
				totalHit: t.totalHit,
				maxPossible
			}));

			return {
				id: event.id,
				eventName: event.eventName,
				eventState: event.eventState,
				createdAt: event.createdAt.toISOString(),
				currentTeamIndex: event.currentTeamIndex,
				currentStationIndex: event.currentStationIndex,
				currentPresentationIndex: event.currentPresentationIndex,
				maxPossible,
				podium,
				winner: podium[0] ?? null,
				teams,
				round: event.rounds[0]
					? {
							id: event.rounds[0].id,
							roundName: event.rounds[0].roundName,
							roundIndex: event.rounds[0].roundIndex,
							stations: stations.map(st => ({
								id: st.id,
								stationIndex: st.stationIndex,
								launchType: st.launchType,
								sequence: st.sequence,
								totalClays: st.totalClays
							}))
					  }
					: null
			};
		}),
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
