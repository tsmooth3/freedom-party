import type { PageServerLoad } from "./$types";
import type { prismaShootEvent } from "$lib/shared/utils";

export const load: PageServerLoad = async ({ fetch }) => {
    const dbShootEventResponse = await fetch('/api/shootEvents?sortOrder=desc')
    const dbShootEvents: prismaShootEvent[] = await dbShootEventResponse.json()

    return { dbShootEvents }
};