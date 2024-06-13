import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = async ({ url }) => {
    if (url.searchParams.get('eventId')) {
        const teamScores = await prisma.team.findMany({
            where: {
                eventId: {
                    equals: Number(url.searchParams.get('eventId'))
                }
            },
            orderBy: {
                id: 'asc'
            },
            include: {
                teamRounds: {
                    orderBy: {
                        roundIndex: 'asc'
                    }
                }
            }
        })
        return json(teamScores)
    }
    const teamScores = await prisma.team.findMany()
    return json(teamScores)
};