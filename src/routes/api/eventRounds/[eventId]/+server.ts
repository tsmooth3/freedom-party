import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';
// import type { EventState, prismaEventRound } from '$lib/shared/utils';

export const GET: RequestHandler = async ({ params }) => {
    let eventId = params.eventId
    try {
        const eventRounds = await prisma.eventRound.findMany({
            where: {
                eventId: {
                    equals: Number(eventId)
                },
                // roundState: {
                //     not: "COMPLETE"
                // }
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
        if (eventRounds.length > 0) return json(eventRounds)
        return json({ success: false, message: "no results for event: " + eventId })
    } catch (error) {
        return json({ success: false, message: error })
    }
};