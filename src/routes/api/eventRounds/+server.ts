import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import type { EventState, prismaEventRound } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ url }) => {
    let eventId: number | undefined = Number(url.searchParams.get('eventId'))
    let teamId: number | undefined = Number(url.searchParams.get('teamId'))
    let roundIndex: number | undefined = Number(url.searchParams.get('roundIndex'))

    if (eventId) {
        if (teamId && roundIndex) {
            try {
                const eventRounds = await prisma.eventRound.findFirstOrThrow({
                    where: {
                        eventId: {
                            equals: Number(url.searchParams.get('eventId'))
                        },
                        teamId: {
                            equals: Number(url.searchParams.get('teamId'))
                        },
                        roundIndex: {
                            equals: Number(url.searchParams.get('roundIndex'))
                        }
                    }
                })
                return json(eventRounds)
            } catch (error) {
                return json({ success: false, message: error })
            }
        }
        try {
            const eventRounds = await prisma.eventRound.findMany({
                where: {
                    eventId: {
                        equals: Number(url.searchParams.get('eventId'))
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
    } else {
        try {
            const eventRounds = await prisma.eventRound.findMany()
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
    let body: prismaEventRound = await request.json()
    let state: EventState
    if (body.roundClays.match("-")) {
        state = "ACTIVE"
    } else {
        state = "COMPLETE"
    }
    if (eventId === body.eventId && teamId === body.teamId && roundIndex === body.roundIndex) {
        try {
            const eventRound = await prisma.eventRound.update({
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
