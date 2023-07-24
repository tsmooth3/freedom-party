import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    return {
        dbShootEvents: await prisma.shootEvent.findMany(),
        dbEventRounds: await prisma.eventRound.findMany(),
        dbTeamScores: await prisma.teamScore.findMany()
    }
};

export const actions: Actions = {
    addShootEvent: async ({ request }) => {
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