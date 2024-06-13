import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {

    const eventId = Number(params.eventId)
    const teamId = Number(params.teamId)
    try {
        const teamScoreResponse = await prisma.team.update({
            where: { id: teamId, eventId: eventId },
            data: { teamState: "ACTIVE" }
        })
        return json({ success: true, eventId: eventId, teamId: teamId, state: 'ACTIVE' })
    } catch (error) {
        return json({ success: false, message: error })
    }
};