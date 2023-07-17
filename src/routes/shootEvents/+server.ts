import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addShootEvent, removeShootEvent } from '$lib/server/database';
import type { ShootEvent } from '$lib/server/database';

type responseData = {
    success: boolean
    errors: Record<string, string>
}
export const POST: RequestHandler = async ( {request}) => {
    const formData = await request.formData();
    const shootEvent: ShootEvent = {
        eventId: Date.now(),
        eventDate: new Date(),
        eventActive: false,
        eventComplete: false,
        eventFormat: [],
        eventTeamScores: [],
    }
    const data: responseData = {
        success: false,
        errors: {}
    }

    if (!shootEvent) {
        data.errors.shootEvent = 'required'
        return json(data, {status: 400} )
    }
    
    addShootEvent(shootEvent);
    data.success = true;
    return json(data);
};

export const DELETE: RequestHandler = async ( {request} ) => {
    const formData = await request.formData();
    const eventId = Number(formData.get('id'));

    removeShootEvent(eventId);

    return json( {success: true })

};