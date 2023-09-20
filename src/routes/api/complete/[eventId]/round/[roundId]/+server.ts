import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {

    const eventId = Number(params.eventId)
    const teamScoreId = Number(params.roundId)
    try {
        await prisma.eventRound.update({
            where: { id: teamScoreId, eventId: eventId },
            data: { roundState: "COMPLETE" }
        })
        return json({ success: true })
    } catch (error) {
        return json({ success: false, message: error })
    }
};