import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const GET: RequestHandler = async ({ params }) => {
    const eventId = Number(params.eventId)
    const teamScores = await prisma.teamScore.findMany({
        where: {
            eventId: {
                equals: eventId
            }
        },
        orderBy: [
            {
                teamTotal: 'desc',
            },
            {
                teamShotsFired: 'asc'
            }
        ],
    })
    return json(teamScores)
};