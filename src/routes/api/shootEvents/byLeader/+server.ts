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
            eventTeams: {
                orderBy: [
                    { teamTotal: 'desc' },
                    { teamShotsFired: 'asc' }
                ],
                include: {
                    teamRounds: {
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