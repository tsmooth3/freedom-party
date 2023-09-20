import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {

    if (url.searchParams.get('roundAmmo') && url.searchParams.get('roundClays')) {
        const teamScoreId = Number(params.roundId)
        const roundAmmo = String(url.searchParams.get('roundAmmo'))
        const roundClays = String(url.searchParams.get('roundClays'))
        try {
            await prisma.eventRound.update({
                where: { id: teamScoreId },
                data: {
                    roundAmmo: roundAmmo,
                    roundClays: roundClays,
                    roundState: "ACTIVE"
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