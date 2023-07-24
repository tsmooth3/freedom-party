import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
    return {
        dbShootEvents: await prisma.shootEvent.findFirstOrThrow({
            where: {
                id: {
                    equals: Number(params.eventId)
                }
            }
        }),
        dbEventRounds: await prisma.eventRound.findMany({
            where: {
                eventId: {
                    equals: Number(params.eventId)
                }
            }
        }),
        dbTeamScores: await prisma.teamScore.findMany({
            where: {
                eventId: {
                    equals: Number(params.eventId)
                }
            }
        })
    }
};

export const actions: Actions = {
    startEvent: async ({ request }) => {
        const { eventName, eventState } = Object.fromEntries(await request.formData()) as {
            eventName: string
            eventState: string
        }

        try {
            await prisma.shootEvent.create({
                data: {
                    eventName,
                    eventState
                }
            })
        } catch (err) {
            console.log(err)
            return fail(500, { message: 'Could not add shootEvent' })
        }
    }
}