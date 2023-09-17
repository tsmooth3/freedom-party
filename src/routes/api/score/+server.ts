import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {

    if (url.searchParams.get('teamScoreId') && url.searchParams.get('roundAmmo') && url.searchParams.get('roundClays')) {
        const teamScoreId = Number(url.searchParams.get('teamScoreId'))
        const roundAmmo = String(url.searchParams.get('roundAmmo'))
        const roundClays = String(url.searchParams.get('roundClays'))
        try {
            const eventRoundResponse = await prisma.eventRound.update({
                where: { id: teamScoreId },
                data: {
                    roundAmmo: roundAmmo,
                    roundClays: roundClays,
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