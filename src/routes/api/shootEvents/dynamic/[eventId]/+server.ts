import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const eventId = Number(params.eventId);
	if (isNaN(eventId)) {
		return json({ success: false, message: 'Invalid Event ID' }, { status: 400 });
	}

	try {
		const event = await prisma.dynamicEvent.findUnique({
			where: { id: eventId },
			include: {
				teams: {
					include: {
						stationScores: {
							include: {
								station: true
							}
						}
					}
				},
				rounds: {
					include: {
						stations: true
					}
				}
			}
		});

		if (!event) {
			return json({ success: false, message: 'Event not found' }, { status: 404 });
		}

		// Calculate totals and format team score objects
		const teamsWithScores = event.teams.map(team => {
			let totalHit = 0;
			let totalPossible = 0;

			const scoresByStationIndex = team.stationScores.reduce((acc: any, score) => {
				acc[score.station.stationIndex] = score.claysHit;
				totalHit += score.claysHit;
				totalPossible += score.station.totalClays;
				return acc;
			}, {});

			return {
				id: team.id,
				teamName: team.teamName,
				shooter1: team.shooter1,
				shooter2: team.shooter2,
				scores: scoresByStationIndex, // e.g. {1: 3, 2: 4, 3: 1}
				totalHit,
				totalPossible
			};
		}).sort((a, b) => b.totalHit - a.totalHit); // Sort by highest hits (leaderboard!)

		return json({
			id: event.id,
			eventName: event.eventName,
			eventState: event.eventState,
			roundName: event.rounds[0]?.roundName || 'Round 1',
			stations: event.rounds[0]?.stations.map(st => ({
				stationIndex: st.stationIndex,
				launchType: st.launchType,
				sequence: st.sequence,
				totalClays: st.totalClays
			})) || [],
			teams: teamsWithScores
		});
	} catch (error: any) {
		console.error('Failed to load dynamic event watch data:', error);
		return json({ success: false, message: 'Server error' }, { status: 500 });
	}
};
