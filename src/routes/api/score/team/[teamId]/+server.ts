import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {

    if (url.searchParams.get('teamTotal') && url.searchParams.get('teamShotsFired')) {
        const teamId = Number(params.teamId)
        const teamTotal = Number(url.searchParams.get('teamTotal'))
        const teamShotsFired = Number(url.searchParams.get('teamShotsFired'))
        try {
            await prisma.team.update({
                where: { id: teamId },
                data: {
                    teamTotal: teamTotal,
                    teamShotsFired: teamShotsFired,
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