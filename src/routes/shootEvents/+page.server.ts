import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import shell from '$lib/images/shell.svg'
import clay from '$lib/images/capshield.svg'
import { addShootEvent, clearEventRounds, clearEventTeams, clearShootEvents, getShootEvents, removeShootEvent, type ShootEvent, type EventRound, addRoundToEvent, getShootEventById, type TeamScore, addTeamToEvent } from '$lib/server/database';



export const load: PageServerLoad = async () => {

    const shootEvents = getShootEvents();

    return { shootEvents };
}

export const actions: Actions = {
    addShootEvent: async ({ request }) => {
        const formData = await request.formData()
        const shootEvent: ShootEvent = {
            eventId: Date.now(),
            eventDate: new Date(),
            eventActive: false,
            eventComplete: false,
            eventFormat: [],
            eventTeamScores: [],
        }

        if(!shootEvent) {
            return fail(400, {shootEvent, missing:true})
        }

        addShootEvent(shootEvent);
        return {success: true}
    },
    addTeamToShootEvent: async ({ request }) => {
        const formData = await request.formData()
        const eventId = Number(formData.get('id'))
        let se = getShootEventById(eventId)
        if(se){
            let teamIdIndex = se.eventTeamScores.length
            if(teamIdIndex >= 0) teamIdIndex++
            const teamName = String(formData.get('teamName'))
            const shooter1 = String(formData.get('shooter1'))
            const shooter2 = String(formData.get('shooter2'))
            
            if(!teamName) return fail(400, {teamName, missingName:true})
            if(!shooter1) return fail(400, {shooter1, missingS1:true})
            if(!shooter2) return fail(400, {shooter2, missingS2:true})
            
            let teamData: TeamScore = {
                teamId: teamIdIndex,
                teamName: teamName,
                shooter1: shooter1,
                shooter2: shooter2,
                roundScores: []
            }
            
            addTeamToEvent(eventId, teamData)
        }
    },
    addRoundToShootEvent: async ({ request }) => {
        const formData = await request.formData()
        const eventId = Number(formData.get('id'))
        let se = getShootEventById(eventId)
        if(se){
            let roundIdIndex = se.eventFormat.length
            if(roundIdIndex >= 0) roundIdIndex++
            const roundName = String(formData.get('roundName'))
            const ammos = Number(formData.get('roundAmmo'))
            const clays = Number(formData.get('roundClays'))

            if(!roundName) return fail(400, {roundName, missingName:true})
            if(!ammos) return fail(400, {ammos, missingAmmo:true})
            if(!clays) return fail(400, {clays, missingClays:true})
            
            let roundData: EventRound = {
                roundId: roundIdIndex,
                roundName: roundName,
                roundAmmo: "-".repeat(ammos),
                roundClays: "-".repeat(clays),
                roundActive: false,
                roundComplete: false,
            }
            
            addRoundToEvent(eventId, roundData)
        }
    },
    removeShootEvent: async ({ request }) => {
        const formData = await request.formData()
        const eventId = Number(formData.get('id'));

        removeShootEvent(eventId)

        return {success: true}
    },
    // removeTeamFromShootEvent: async ({ request }) => {},
    // removeRoundFromShootEvent: async ({ request }) => {},
    clearShootEvents: async ({ request }) => {
        clearShootEvents()
    },
    // clearEventTeams: async ({ request }) => {
        // clearEventTeams(request)
    // },
    // clearEventRounds: async ({ request }) => {
        // clearEventRounds()
    // },
}