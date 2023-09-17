import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = async ({ url }) => {
    if (url.searchParams.get('eventId')) {
        const teamScores = await prisma.teamScore.findMany({
            where: {
                eventId: {
                    equals: Number(url.searchParams.get('eventId'))
                }
            },
            orderBy: {
                id: 'asc'
            },
            include: {
                teamScores: {
                    orderBy: {
                        roundIndex: 'asc'
                    }
                }
            }
        })
        return json(teamScores)
    }
    const teamScores = await prisma.teamScore.findMany()
    return json(teamScores)
};