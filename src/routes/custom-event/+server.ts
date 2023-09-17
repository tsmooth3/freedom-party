import type { prismaShootEvent } from '$lib/shared/utils'
import { event } from 'sveltekit-sse'

const delay = (milliseconds: number) => new Promise(r => setTimeout(r, milliseconds))

export function GET() {
    return event(async emit => {
        while (true) {
            const teamScores = await prisma.teamScore.findMany({
                where: {
                    eventId: {
                        equals: 18
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
            emit(JSON.stringify(teamScores))
            await delay(5000)
        }
    }).toResponse()
}