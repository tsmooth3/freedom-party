import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const sortOrder = 'desc'
    const eventId = Number(params.eventId)

    if (!params.eventId || isNaN(eventId)) {
        return json({ error: 'Invalid or missing eventId parameter' }, { status: 400 })
    }

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
                        },
                        include: {
                            roundStationFormat: {
                                orderBy: {
                                    stationIndex: 'asc'
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    return json(shootEvents)
};