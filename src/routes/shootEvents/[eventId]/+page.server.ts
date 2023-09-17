import type { PageServerLoad } from "../$types";
import type { prismaEventRound, prismaShootEvent, prismaTeamScore } from "$lib/shared/utils";
import type { Actions } from "@sveltejs/kit";
import { invalidateAll } from "$app/navigation";

export const load: PageServerLoad = async ({ fetch, params }) => {
    const id = params.eventId
    const dbShootEventResponse = await fetch('/api/shootEvents?eventId=' + id)
    const dbShootEvents: prismaShootEvent[] = await dbShootEventResponse.json()
    const dbActiveShootEventResponse = await fetch('/api/shootEvents?eventId=' + id + '&active=true')
    const dbActiveShootEvents: prismaShootEvent[] = await dbActiveShootEventResponse.json()
    const dbTeamScoresResponse = await fetch('/api/teamScores?eventId=' + id)
    const dbTeamScores: prismaTeamScore[] = await dbTeamScoresResponse.json()
    const dbEventRoundsResponse = await fetch('/api/eventRounds?eventId=' + id)
    const dbEventRounds: prismaEventRound[] = await dbEventRoundsResponse.json()

    return { dbShootEvents, dbTeamScores, dbEventRounds, dbActiveShootEvents }
};

export const actions: Actions = {
    startEvent: async ({ fetch, request }) => {
        const formData = await request.formData()
        const eventId = Number(formData.get('eventId'))
        const teamId = Number(formData.get('teamId'))
        const teamId2 = Number(formData.get('teamId2'))
        const teamScoreId = Number(formData.get('teamScoreId'))
        const response = await fetch('/api/activate?eventId=' + eventId + '&teamId=' + teamId + '&teamId2=' + teamId2 + '&teamScoreId=' + teamScoreId)
        return { success: true }
    },
    shot: async ({ fetch, request }) => {
        const formData = await request.formData()
        const teamScoreId = Number(formData.get('teamScoreId'))
        let ammo = String(formData.get('roundAmmo'))
        let clays = String(formData.get('roundClays'))
        ammo = ammo.replace('-', 'x')
        if (!ammo.includes('-')) {
            clays = clays.replaceAll('-', 'o')
        }
        const response = await fetch('/api/score?teamScoreId=' + teamScoreId + '&roundAmmo=' + ammo + '&roundClays=' + clays)
        return { success: true }
    },
    kill: async ({ fetch, request }) => {
        const formData = await request.formData()
        const teamScoreId = Number(formData.get('teamScoreId'))
        let ammo = String(formData.get('roundAmmo'))
        let clays = String(formData.get('roundClays'))
        ammo = ammo.replace('-', 'x')
        clays = clays.replace('-', 'x')
        if (!ammo.includes('-')) {
            clays = clays.replaceAll('-', 'o')
        }
        const response = await fetch('/api/score?teamScoreId=' + teamScoreId + '&roundAmmo=' + ammo + '&roundClays=' + clays)
        return { success: true }
    },
    lost: async ({ fetch, request }) => {
        const formData = await request.formData()
        const teamScoreId = Number(formData.get('teamScoreId'))
        let ammo = String(formData.get('roundAmmo'))
        let clays = String(formData.get('roundClays'))
        clays = clays.replace('-', 'o')
        const response = await fetch('/api/score?teamScoreId=' + teamScoreId + '&roundAmmo=' + ammo + '&roundClays=' + clays)
        return { success: true }
    },
    undo: async ({ fetch, request }) => {
        const formData = await request.formData()
        const teamScoreId = Number(formData.get('teamScoreId'))
        let ammo = String(formData.get('roundAmmo'))
        let clays = String(formData.get('roundClays'))
        ammo = ammo.replaceAll('x', '-')
        clays = clays.replaceAll('x', '-').replaceAll('o', '-')
        const response = await fetch('/api/score?teamScoreId=' + teamScoreId + '&roundAmmo=' + ammo + '&roundClays=' + clays)
        return { success: true }
    },
    completeRound: async ({ fetch, request }) => {
        const formData = await request.formData()
        const teamScoreId = Number(formData.get('teamScoreId'))
        const teamState = String(formData.get('teamState'))
        const eventId = Number(formData.get('eventId'))
        const teamId = Number(formData.get('teamId'))
        const teamId2 = Number(formData.get('teamId2'))
        console.log("teamScoreId: " + teamScoreId)
        console.log("teamState: " + teamState)
        console.log("teamId: " + teamId)
        console.log("teamId2: " + teamId2)
        const response = await fetch('/api/complete?eventId=' + eventId + '&teamId=' + teamId + '&teamId2=' + teamId2 + '&teamScoreId=' + teamScoreId + '&teamState=' + teamState)
        invalidateAll
        return { success: true }
    }
};