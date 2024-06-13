import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {

    if (url.searchParams.get('eventId') && url.searchParams.get('teamId') && url.searchParams.get('teamId2') && url.searchParams.get('teamScoreId')) {
        const eventId = Number(url.searchParams.get('eventId'))
        const teamId = Number(url.searchParams.get('teamId'))
        const teamId2 = Number(url.searchParams.get('teamId2'))
        const teamScoreId = Number(url.searchParams.get('teamScoreId'))
        try {
            const shootEventResponse = prisma.shootEvent.update({
                where: { id: eventId },
                data: { eventState: "ACTIVE" }
            })
            const teamScoreResponse = prisma.team.update({
                where: { id: teamId },
                data: { teamState: "ACTIVE" }
            })
            const teamScore2Response = prisma.team.update({
                where: { id: teamId2 },
                data: { teamState: "ONDECK" }
            })
            const eventRoundResponse = prisma.round.update({
                where: { id: teamScoreId },
                data: { roundState: "ACTIVE" }
            })

            const transactions = await prisma.$transaction([shootEventResponse, teamScoreResponse, teamScore2Response, eventRoundResponse])
            return json({ success: true, eventId: eventId, teamId: teamId, teamScoreId: teamScoreId, state: 'ACTIVE' })
        } catch (error) {
            return json({ success: false, message: error })
        }
    } else {
        return json({ success: false, message: "missing required params" })
    }
};