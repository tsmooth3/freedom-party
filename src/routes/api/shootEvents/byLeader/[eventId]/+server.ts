import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const sortOrder = 'desc'
    const eventId = Number(params.eventId)

    const shootEvents = await prisma.shootEvent.findMany({
        where: {
            id: eventId
        },
        include: {
            eventTeamScores: {
                orderBy: [
                    { teamTotal: 'desc' },
                    { teamShotsFired: 'asc' }
                ],
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
};