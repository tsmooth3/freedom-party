import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, params }) => {

    if (url.searchParams.get('teamState') && url.searchParams.get('teamId') && url.searchParams.get('teamId2') && url.searchParams.get('teamScoreId')) {
        const eventId = Number(params.eventId)
        const teamState = String(url.searchParams.get('teamState'))
        const teamId = Number(url.searchParams.get('teamId'))
        const teamId2 = Number(url.searchParams.get('teamId2'))
        const teamScoreId = Number(url.searchParams.get('teamScoreId'))
        try {
            const teamScoreResponse = prisma.teamScore.update({
                where: { id: teamId },
                data: { teamState: teamState }
            })
            const teamScore2Response = prisma.teamScore.update({
                where: { id: teamId2 },
                data: { teamState: "ACTIVE" }
            })
            const eventRoundResponse = prisma.eventRound.update({
                where: { id: teamScoreId },
                data: { roundState: "COMPLETE" }
            })
            const transactions = await prisma.$transaction([teamScoreResponse, teamScore2Response, eventRoundResponse])
            const teamScores = await prisma.teamScore.findMany({
                where: {
                    eventId: {
                        equals: eventId
                    }
                },
                orderBy: {
                    id: 'asc'
                }
            });

            let onDeck = teamScores.findIndex(
                (p) => p.teamState === 'ACTIVE'
            )
            if (onDeck + 1 === teamScores.length && teamScores[0].teamState === 'IDLE') {
                onDeck = 0
            } else {
                onDeck++;
            }
            const setOndeck = prisma.teamScore.update({
                where: { id: teamScores[onDeck].id },
                data: { teamState: 'ONDECK' }
            })
            const transactions2 = await prisma.$transaction([setOndeck])
            return json({ success: true })
        } catch (error) {
            return json({ success: false, message: error })
        }
    } else {
        return json({ success: false, message: "missing required params" })
    }
};