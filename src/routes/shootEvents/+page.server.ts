import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";

export const load: PageServerLoad = async () => {
    return {
        dbShootEvents: await prisma.shootEvent.findMany(),
        dbEventRounds: await prisma.eventRound.findMany(),
        dbTeamScores: await prisma.teamScore.findMany()
    }
};