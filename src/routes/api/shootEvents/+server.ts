import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { TeamScore, EventRound } from '$lib/shared/utils';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const urlSortOrder: any = url.searchParams.get('sortOrder')
    const sortOrder = urlSortOrder === 'asc' || urlSortOrder === 'desc' ? urlSortOrder : 'asc'

    if (url.searchParams.get('eventId')) {
        if (url.searchParams.get('active')) {
            const shootEvents = await prisma.shootEvent.findMany({
                where: {
                    id: {
                        equals: Number(url.searchParams.get('eventId'))
                    }
                },
                include: {
                    eventTeamScores: {
                        orderBy: {
                            teamState: 'asc'
                        },
                        include: {
                            teamScores: {
                                orderBy: [
                                    { roundState: 'asc' },
                                    { roundIndex: 'asc' }
                                ]
                            }
                        }
                    }
                }
            })
            return json(shootEvents)
        } else {
            const shootEvents = await prisma.shootEvent.findMany({
                where: {
                    id: {
                        equals: Number(url.searchParams.get('eventId'))
                    }
                },
                include: {
                    eventTeamScores: {
                        orderBy: {
                            id: 'asc'
                        },
                        include: {
                            teamScores: {
                                orderBy: {
                                    roundIndex: 'asc'
                                }
                            }
                        }
                    }
                }
            })
            return json(shootEvents)
        }
    } else {
        const shootEvents = await prisma.shootEvent.findMany({
            orderBy: {
                id: sortOrder
            },
            include: {
                eventTeamScores: {
                    include: {
                        teamScores: {
                            orderBy: {
                                roundIndex: 'asc'
                            }
                        }
                    }
                }
            }
        })
        return json(shootEvents)
    }
};

export const POST: RequestHandler = async ({ request }) => {
    const reqBody = await request.json()
    let eventId: number = -1

    try {
        const newShootEvent = await prisma.shootEvent.create({
            data: {
                eventName: reqBody.eventName,
                eventState: reqBody.eventState
            }
        })
        eventId = await newShootEvent.id

        const promise1 = await reqBody.eventTeamScores.forEach(async (team: TeamScore) => {
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

            let teamId = await newTeam.id
            await team.teamScores.forEach(async (round: EventRound) => {
                let roundName = round.roundName
                let roundIndex = round.roundId
                let roundStations = round.roundStations
                let roundAmmo = round.roundAmmo
                let roundClays = round.roundClays
                let roundState = round.roundState
                await prisma.eventRound.create({
                    data: {
                        eventId,
                        teamId,
                        roundName,
                        roundIndex,
                        roundStations,
                        roundAmmo,
                        roundClays,
                        roundState
                    }
                })
            })
        });
        return await json({ success: true, eventId: eventId });
    } catch (err) {
        return json({ success: false, message: 'Could not add shootEvent' })
    }
}

export const DELETE: RequestHandler = async ({ url }) => {
    if (url.searchParams.get('eventId')) {
        try {
            let eventId: number = Number(url.searchParams.get('eventId'))
            const deleteTeamScores = prisma.teamScore.deleteMany({
                where: {
                    eventId: eventId
                }
            })
            const deleteEventRounds = prisma.eventRound.deleteMany({
                where: {
                    eventId: eventId
                }
            })
            const deleteShootEvent = prisma.shootEvent.delete({
                where: {
                    id: eventId
                }
            })

            const deleteTransaction = await prisma.$transaction([deleteEventRounds, deleteTeamScores, deleteShootEvent])
            return json({ success: true, message: "EventId: " + eventId + " Deleted" });
        } catch (error) {
            return json({ success: false, message: error })
        }

    } else {
        return json({ success: false });
    }
};