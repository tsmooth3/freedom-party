import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { eventName, teams, stations } = body;

		if (!eventName || !teams || !teams.length || !stations || !stations.length) {
			return json({ success: false, message: 'Missing required event setup data.' }, { status: 400 });
		}

		// Calculate total clays for each station layout
		const stationLayoutsParsed = stations.map((st: any) => {
			const totalClays = st.launchType === 'QUAD_2_PLUS_2' ? 4 : 3;
			return {
				stationIndex: Number(st.stationIndex),
				launchType: st.launchType,
				sequence: st.sequence,
				totalClays,
				trapSequence: st.sequence
			};
		});

		// Create dynamic event using a database transaction
		const result = await prisma.$transaction(async (tx) => {
			// 1. Create Event
			const event = await tx.dynamicEvent.create({
				data: {
					eventName,
					eventState: 'SETUP',
					creatorId: locals.user?.id || null
				}
			});

			// 2. Create Teams
			const createdTeams = await Promise.all(
				teams.map((t: any) =>
					tx.dynamicTeam.create({
						data: {
							eventId: event.id,
							teamName: t.teamName,
							shooter1: t.shooter1,
							shooter2: t.shooter2
						}
					})
				)
			);

			// 3. Create Round 1
			const round = await tx.dynamicRound.create({
				data: {
					eventId: event.id,
					roundName: 'Round 1',
					roundIndex: 1,
					roundState: 'SETUP'
				}
			});

			// 4. Create Station Layouts
			const createdStations = await Promise.all(
				stationLayoutsParsed.map((st: any) =>
					tx.stationLayout.create({
						data: {
							roundId: round.id,
							stationIndex: st.stationIndex,
							launchType: st.launchType,
							sequence: st.sequence,
							totalClays: st.totalClays,
							trapSequence: st.trapSequence
						}
					})
				)
			);

			// 5. Initialize empty scores for each team at each station
			const scorePromises = [];
			for (const team of createdTeams) {
				for (const station of createdStations) {
					scorePromises.push(
						tx.teamStationScore.create({
							data: {
								teamId: team.id,
								stationLayoutId: station.id,
								claysHit: 0,
								shotsFired: 4,
								isComplete: false
							}
						})
					);
				}
			}
			await Promise.all(scorePromises);

			return event;
		});

		return json({ success: true, eventId: result.id });
	} catch (error: any) {
		console.error('Failed to create dynamic event:', error);
		return json({ success: false, message: error.message || 'Server error' }, { status: 500 });
	}
};
