import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {

    if (url.searchParams.get('ammo') && url.searchParams.get('clays')) {
        const teamScoreId = Number(params.stationId)
        const ammo = String(url.searchParams.get('ammo'))
        const clays = String(url.searchParams.get('clays'))
        try {
            await prisma.roundStation.update({
                where: { id: teamScoreId },
                data: {
                    stationAmmo: ammo,
                    stationClays: clays,
                    stationState: "COMPLETE"
                }
            })

            return json({ success: true })
        } catch (error) {
            return json({ success: false, message: error })
        }
    } else {
        return json({ success: false, message: "missing required params" })
    }
};