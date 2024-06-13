import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";

export const load: PageServerLoad = async () => {
    return {
        dbShootEvents: await prisma.shootEvent.findMany(),
        dbEventRounds: await prisma.round.findMany(),
        dbTeamScores: await prisma.team.findMany()
    }
};