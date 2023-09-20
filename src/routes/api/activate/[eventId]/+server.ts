import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {

    const eventId = Number(params.eventId)
    try {
        await prisma.shootEvent.update({
            where: { id: eventId },
            data: { eventState: "ACTIVE" }
        })
        return json({ success: true, eventId: eventId, state: 'ACTIVE' })
    } catch (error) {
        return json({ success: false, message: error })
    }
};