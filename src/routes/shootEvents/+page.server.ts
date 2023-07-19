import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { addShootEvent, clearEventRounds, clearEventTeams, clearShootEvents, getShootEvents, removeShootEvent, type ShootEvent, type EventRound, addRoundToEvent, getShootEventById, type TeamScore, addTeamToEvent } from '$lib/server/database';

export const load: PageServerLoad = async () => {
    const shootEvents = getShootEvents();
    return { shootEvents };
}

export const actions: Actions = {
    addShootEvent: async ({ request }) => {
        const formData = await request.formData()
        const uid = Date.now()
        const shootEvent: ShootEvent = {
            eventId: uid,
            eventDate: new Date(),
            eventName: "Freedom_Clays_" + uid,
            eventState: "NEW",
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
                teamShooter1: shooter1,
                teamShooter2: shooter2,
                teamState: "NEW",
                teamScores: []
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
            const roundStations = Number(formData.get('roundStations'))
            const roundClays = Number(formData.get('roundClays'))
            const roundAmmo = Number(formData.get('roundAmmo'))

            if(!roundName) return fail(400, {roundName, missingName:true})
            if(!roundStations) return fail(400, {roundStations, missingStations:true})
            if(!roundClays) return fail(400, {roundClays, missingClays:true})
            if(!roundAmmo) return fail(400, {roundAmmo, missingAmmo:true})
            
            let roundData: EventRound = {
                roundId: roundIdIndex,
                roundName: roundName,
                roundStations: roundStations,
                roundAmmo: "-".repeat(roundAmmo*roundStations),
                roundClays: "-".repeat(roundClays*roundStations),
                roundState: "NEW",
            }
            
            addRoundToEvent(eventId, roundData)

            return {roundStations: roundStations, roundClays: roundClays, roundAmmo: roundAmmo, success: true}
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
    clearEventRounds: async ({ request }) => {
        const formData = await request.formData()
        const eventId = Number(formData.get('id'));
        clearEventRounds(eventId)
    },
}