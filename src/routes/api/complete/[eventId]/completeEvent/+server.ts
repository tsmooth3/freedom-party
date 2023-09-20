import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {

    const eventId = Number(params.eventId)
    try {
        const teamScoresResponse = prisma.teamScore.updateMany({
            where: { eventId: eventId },
            data: {
                teamState: "COMPLETE"
            }
        })
        const eventRoundsResponse = prisma.eventRound.updateMany({
            where: { eventId: eventId },
            data: {
                roundState: "COMPLETE"
            }
        })
        const shootEventResponse = prisma.shootEvent.update({
            where: { id: eventId },
            data: { eventState: "COMPLETE" }
        })
        const transactions = await prisma.$transaction([teamScoresResponse, eventRoundsResponse, shootEventResponse])
        return json({ success: true })
    } catch (error) {
        return json({ success: false, message: error })
    }
};