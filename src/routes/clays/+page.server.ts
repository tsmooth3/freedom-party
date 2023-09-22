import type { PageServerLoad } from "./$types";
import type { prismaShootEvent } from "$lib/shared/utils";
import type { Actions } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch }) => {
    const dbShootEventResponse = await fetch('/api/shootEvents/byLeader')
    const dbShootEvents: prismaShootEvent[] = await dbShootEventResponse.json()

    return { dbShootEvents }
};


export const actions: Actions = {
    deleteEvent: async ({ fetch, request }) => {
        const formData = await request.formData()
        const eventId = Number(formData.get('eventId'))
        await fetch('/api/shootEvents?eventId=' + eventId, { 'method': 'DELETE' })
        return { success: true }
    }
}