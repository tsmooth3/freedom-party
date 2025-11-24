import type { PageServerLoad } from "../$types";
import type { prismaEventRound, prismaShootEvent} from "$lib/shared/utils";
import type { Actions } from "@sveltejs/kit";
import { invalidateAll } from "$app/navigation";

export const load: PageServerLoad = async ({ fetch, params }) => {
    const id = params.eventId
    const dbShootEventResponse = await fetch('/api/shootEvents/byLeader/' + id)
    const dbShootEvents: prismaShootEvent[] = await dbShootEventResponse.json()
    const dbActiveShootEventResponse = await fetch('/api/shootEvents?eventId=' + id + '&active=true')
    const dbActiveShootEvents: prismaShootEvent[] = await dbActiveShootEventResponse.json()
    const dbEventRoundsResponse = await fetch('/api/eventRounds/' + id)
    const dbEventRounds: prismaEventRound[] = await dbEventRoundsResponse.json()

    return { dbShootEvents, dbEventRounds, dbActiveShootEvents }
};

export const actions: Actions = {
    startEvent: async ({ fetch, request }) => {
        const formData = await request.formData()
        const eventId = Number(formData.get('eventId'))
        const teamId = Number(formData.get('teamId'))
        await fetch('/api/activate/' + eventId)
        // set teamId to ACTIVE
        await fetch('/api/activate/' + eventId + '/team/' + teamId)
        return { success: true }
    },
    undo: async ({ fetch, request }) => {
        const formData = await request.formData()
        const teamId = Number(formData.get('teamId'))
        const teamScoreId = Number(formData.get('teamScoreId'))
        let teamTotal = Number(formData.get('teamTotal'))
        let teamShotsFired = Number(formData.get('teamShotsFired'))
        let ammo = String(formData.get('roundAmmo'))
        let clays = String(formData.get('roundClays'))
        ammo = ammo.replaceAll('x', '-').replaceAll('o', '-')
        clays = clays.replaceAll('x', '-').replaceAll('o', '-')
        await fetch('/api/score/round/' + teamScoreId + '?roundAmmo=' + ammo + '&roundClays=' + clays)
        return { success: true }
    },
    completeRound: async ({ fetch, request }) => {
        const formData = await request.formData()
        const teamScoreId = Number(formData.get('teamScoreId'))
        const eventId = Number(formData.get('eventId'))
        const teamId = Number(formData.get('teamId'))
        const teamId2 = Number(formData.get('teamId2'))

        //score round
        let teamTotal = Number(formData.get('teamTotal'))
        let teamShotsFired = Number(formData.get('teamShotsFired'))
        let ammo = String(formData.get('roundAmmo'))
        let clays = String(formData.get('roundClays'))
        await fetch('/api/score/round/' + teamScoreId + '?roundAmmo=' + ammo + '&roundClays=' + clays)
        await fetch('/api/score/team/' + teamId + '?teamTotal=' + teamTotal + '&teamShotsFired=' + teamShotsFired)

        // set round to complete
        await fetch('/api/complete/' + eventId + '/round/' + teamScoreId)
        if (teamId2 !== -1) {
            // set shootingTeam to IDLE
            await fetch('/api/idle/' + eventId + '/team/' + teamId)
            // set onDeckTeam to ACTIVE
            await fetch('/api/activate/' + eventId + '/team/' + teamId2)
        }
        invalidateAll
        return { success: true }
    },
    submitStation: async ({ fetch, request }) => {
        const formData = await request.formData()
        const teamId = Number(formData.get('teamId'))
        const stationId = Number(formData.get('roundStationId'))
        const completeRound = formData.get('completeRound')
        const roundId = Number(formData.get('roundId'))
        const eventId = Number(formData.get('eventId'))

        //score round
        let teamTotal = Number(formData.get('teamTotal'))
        let teamShotsFired = Number(formData.get('teamShotsFired'))
        let ammo = String(formData.get('stationAmmo'))
        let clays = String(formData.get('stationClays'))
        let roundAmmo = String(formData.get('roundAmmo')) + ammo
        let roundClays = String(formData.get('roundClays')) + clays

        await fetch('/api/score/station/' + stationId + '?ammo=' + ammo + '&clays=' + clays)
        await fetch('/api/score/round/' + roundId + '?roundAmmo=' + roundAmmo + '&roundClays=' + roundClays)
        await fetch('/api/score/team/' + teamId + '?teamTotal=' + teamTotal + '&teamShotsFired=' + teamShotsFired)
        // set round to complete
        if (completeRound === 'true') {
            await fetch('/api/complete/' + eventId + '/round/' + roundId)
        }
        invalidateAll
        return { success: true }
    },
    completeEvent: async ({ fetch, request }) => {
        const formData = await request.formData()
        const eventId = Number(formData.get('eventId'))
        await fetch('/api/complete/' + eventId + '/completeEvent')
        return { success: true }
    }
};