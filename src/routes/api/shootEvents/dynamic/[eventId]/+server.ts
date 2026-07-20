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
						stations: {
							orderBy: { stationIndex: 'asc' }
						}
					}
				}
			}
		});

		if (!event) {
			return json({ success: false, message: 'Event not found' }, { status: 404 });
		}

		const stations =
			event.rounds[0]?.stations.map((st) => ({
				id: st.id,
				stationIndex: st.stationIndex,
				launchType: st.launchType,
				sequence: st.sequence,
				totalClays: st.totalClays,
				maxStand: st.totalClays * 3
			})) || [];

		const totalPossibleAll = stations.reduce((sum, st) => sum + st.maxStand, 0);

		const formattedTeams = event.teams.map((team) => {
			// stationIndex -> presentationIndex (1..3) -> claysHit
			const byStation: Record<
				number,
				{ total: number; presentations: (number | null)[]; maxStand: number; totalClays: number }
			> = {};

			for (const st of stations) {
				byStation[st.stationIndex] = {
					total: 0,
					presentations: [null, null, null],
					maxStand: st.maxStand,
					totalClays: st.totalClays
				};
			}

			for (const score of team.stationScores) {
				// Incomplete rows are pre-created with claysHit 0 — ignore until scored
				if (!score.isComplete) continue;
				const idx = score.station.stationIndex;
				if (!byStation[idx]) {
					byStation[idx] = {
						total: 0,
						presentations: [null, null, null],
						maxStand: score.station.totalClays * 3,
						totalClays: score.station.totalClays
					};
				}
				const p = Math.min(3, Math.max(1, score.presentationIndex)) - 1;
				byStation[idx].presentations[p] = score.claysHit;
				byStation[idx].total += score.claysHit;
			}

			const scores: Record<number, number> = {};
			const presentationScores: Record<number, (number | null)[]> = {};
			let totalHit = 0;
			let perfectStands = 0;
			let perfectPresentations = 0;

			for (const st of stations) {
				const cell = byStation[st.stationIndex];
				scores[st.stationIndex] = cell.total;
				presentationScores[st.stationIndex] = cell.presentations;
				totalHit += cell.total;
				const standComplete = cell.presentations.every((v) => v !== null);
				if (standComplete && cell.total === st.maxStand) perfectStands += 1;
				for (let i = 0; i < 3; i++) {
					const hit = cell.presentations[i];
					if (hit !== null && hit === st.totalClays) perfectPresentations += 1;
				}
			}

			const accuracy =
				totalPossibleAll > 0 ? Math.round((totalHit / totalPossibleAll) * 1000) / 10 : 0;

			return {
				id: team.id,
				teamName: team.teamName,
				shooter1: team.shooter1,
				shooter2: team.shooter2,
				scores,
				presentationScores,
				totalHit,
				totalPossible: totalPossibleAll,
				accuracy,
				perfectStands,
				perfectPresentations
			};
		});

		// Sort: totalHit desc, then perfect stands, then perfect presentations
		const sortedTeamsForLeaderboard = [...formattedTeams].sort((a, b) => {
			if (b.totalHit !== a.totalHit) return b.totalHit - a.totalHit;
			if (b.perfectStands !== a.perfectStands) return b.perfectStands - a.perfectStands;
			if (b.perfectPresentations !== a.perfectPresentations)
				return b.perfectPresentations - a.perfectPresentations;
			return a.teamName.localeCompare(b.teamName);
		});

		const winner = sortedTeamsForLeaderboard[0] ?? null;

		return json({
			id: event.id,
			eventName: event.eventName,
			eventState: event.eventState,
			currentTeamIndex: event.currentTeamIndex,
			currentStationIndex: event.currentStationIndex,
			currentPresentationIndex: event.currentPresentationIndex,
			roundName: event.rounds[0]?.roundName || 'Round 1',
			stations,
			teams: sortedTeamsForLeaderboard,
			rawTeams: formattedTeams,
			winner: winner
				? {
						teamName: winner.teamName,
						shooter1: winner.shooter1,
						shooter2: winner.shooter2,
						totalHit: winner.totalHit,
						totalPossible: winner.totalPossible,
						accuracy: winner.accuracy
					}
				: null
		});
	} catch (error: any) {
		console.error('Failed to load dynamic event watch data:', error);
		return json({ success: false, message: 'Server error' }, { status: 500 });
	}
};
