import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.isAdmin) {
		return {
			legacyEvents: [],
			dynamicEvents: [],
			users: [],
			currentUserId: null
		};
	}

	const [legacy, dynamic, users] = await Promise.all([
		prisma.shootEvent.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				_count: {
					select: {
						eventFormat: true,
						eventTeamScores: true
					}
				}
			}
		}),
		prisma.dynamicEvent.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				creator: { select: { id: true, name: true, email: true } },
				_count: {
					select: {
						teams: true,
						rounds: true
					}
				},
				rounds: {
					take: 1,
					orderBy: { roundIndex: 'asc' },
					include: {
						_count: { select: { stations: true } }
					}
				}
			}
		}),
		prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				_count: { select: { createdEvents: true } }
			}
		})
	]);

	const currentUserId =
		locals.user?.authType === 'GOOGLE' && typeof locals.user.id === 'number'
			? locals.user.id
			: null;

	return {
		currentUserId,
		legacyEvents: legacy.map((event) => ({
			id: event.id,
			eventName: event.eventName,
			eventState: event.eventState,
			createdAt: event.createdAt.toISOString(),
			roundsCount: event._count.eventFormat,
			teamsCount: event._count.eventTeamScores
		})),
		dynamicEvents: dynamic.map((event) => ({
			id: event.id,
			eventName: event.eventName,
			eventState: event.eventState,
			createdAt: event.createdAt.toISOString(),
			teamsCount: event._count.teams,
			standsCount: event.rounds[0]?._count.stations ?? 0,
			creator: event.creator
				? {
						id: event.creator.id,
						name: event.creator.name,
						email: event.creator.email
					}
				: null
		})),
		users: users.map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			role: u.role,
			createdAt: u.createdAt.toISOString(),
			eventsCreated: u._count.createdEvents
		}))
	};
};
