import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import type { EventState, prismaRound } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
    let eventId: number | undefined = Number(url.searchParams.get('eventId'))
    let teamId: number | undefined = Number(url.searchParams.get('teamId'))
    let roundIndex: number | undefined = Number(url.searchParams.get('roundIndex'))
    let incomplete: number | undefined = Number(url.searchParams.get('incomplete'))

    if (eventId) {

        if (incomplete) {
            try {
                const inCompleteRounds = await prisma.round.findMany({
                    where: {
                        eventId: {
                            equals: eventId
                        },
                        roundState: {
                            not: "COMPLETE"
                        }
                    },
                    orderBy: [
                        {
                            roundIndex: 'asc'
                        },
                        {
                            teamId: 'asc'
                        }
                    ]
                })
                if (inCompleteRounds.length > 0) return json(inCompleteRounds)
                return json([])
            } catch (error) {
                return json({ success: false, message: error })
            }
        } else if (teamId && roundIndex) {
            try {
                const eventRounds = await prisma.round.findFirstOrThrow({
                    where: {
                        eventId: {
                            equals: eventId
                        },
                        teamId: {
                            equals: teamId
                        },
                        roundIndex: {
                            equals: roundIndex
                        }
                    }
                })
                return json(eventRounds)
            } catch (error) {
                return json({ success: false, message: error })
            }
        } else {

            try {
                const eventRounds = await prisma.round.findMany({
                    where: {
                        eventId: {
                            equals: eventId
                        }
                    },
                    orderBy: [
                        {
                            teamId: 'asc'
                        },
                        {
                            roundIndex: 'asc'
                        }
                    ]
                })
                return json(eventRounds)
            } catch (error) {
                return json({ success: false, message: error })
            }
        }
    } else {
        try {
            const eventRounds = await prisma.round.findMany()
            return json(eventRounds)
        } catch (error) {
            return json({ success: false, message: error })
        }
    }
};

export const PUT: RequestHandler = async ({ url, request }) => {
    let eventId: number | undefined = Number(url.searchParams.get('eventId'))
    let teamId: number | undefined = Number(url.searchParams.get('teamId'))
    let roundIndex: number | undefined = Number(url.searchParams.get('roundIndex'))
    let body: prismaRound = await request.json()
    let state: EventState
    if (body.roundClays.match("-")) {
        state = "ACTIVE"
    } else {
        state = "COMPLETE"
    }
    if (eventId === body.eventId && teamId === body.teamId && roundIndex === body.roundIndex) {
        try {
            const eventRound = await prisma.round.update({
                where: {
                    id: body.id,
                    eventId: eventId,
                    teamId: teamId,
                    roundIndex: roundIndex,
                },
                data: {
                    roundAmmo: body.roundAmmo,
                    roundClays: body.roundClays,
                    roundState: state
                }
            })
            return json({ success: true })

        } catch (error) {
            return json({ success: false, message: error })
        }
    }
    return json({ success: false })
};
