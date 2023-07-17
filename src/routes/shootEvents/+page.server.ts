import type { PageServerLoad } from './$types';
import { getShootEvents } from '$lib/server/database';



export const load: PageServerLoad = async () => {

    const shootEvents = getShootEvents();

    return { shootEvents };
}