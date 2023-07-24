import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { TeamScore, EventRound } from '$lib/shared/utils.js';

export async function POST({ request }) {
    const reqBody = await request.json()
    let eventName = reqBody.eventName
    let eventState = reqBody.eventState
    let eventId: number = -1

    try {
        const newShootEvent = await prisma.shootEvent.create({
            data: {
                eventName,
                eventState
            }
        })
        eventId = newShootEvent.id

        reqBody.eventTeamScores.forEach(async (team: TeamScore) => {
            let teamName = team.teamName
            let teamShooter1 = team.teamShooter1
            let teamShooter2 = team.teamShooter2
            let teamState = team.teamState

            const newTeam = await prisma.teamScore.create({
                data: {
                    eventId,
                    teamName,
                    teamShooter1,
                    teamShooter2,
                    teamState
                }
            })

            let teamId = newTeam.id
            team.teamScores.forEach(async (round: EventRound) => {
                let roundName = round.roundName
                let roundStations = round.roundStations
                let roundAmmo = round.roundAmmo
                let roundClays = round.roundClays
                let roundState = round.roundState
                await prisma.eventRound.create({
                    data: {
                        eventId,
                        teamId,
                        roundName,
                        roundStations,
                        roundAmmo,
                        roundClays,
                        roundState
                    }
                })
            })
        });

    } catch (err) {
        return json({ success: false, message: 'Could not add shootEvent' })
    }

    return json({ success: true, eventId: eventId });
}