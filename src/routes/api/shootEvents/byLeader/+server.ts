import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ }) => {
    const sortOrder = 'desc'

    const shootEvents = await prisma.shootEvent.findMany({
        orderBy: {
            id: sortOrder
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