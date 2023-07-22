import type { EventState, ShootEvent, EventRound, TeamScore } from "$lib/shared/utils"

let startUp = Date.now()

let shootEvents: ShootEvent[] = []

export function addShootEvent(se: ShootEvent) {
    if(!shootEvents.find((e) => e.eventId === se.eventId)){
        shootEvents.push(se);
    }
}

export function addRoundToEvent(id: number, ef: EventRound) {
    let se = shootEvents.find( (e) => e.eventId === id)
    if(se){
        se.eventFormat.push(ef);
        se.eventTeamScores.forEach(team => {
            if(se) team.teamScores = se.eventFormat
        })
    }
}

export function addTeamToEvent(id: number, t: TeamScore) {
    let se = shootEvents.find((e) => e.eventId === id)
    if(se){
        se.eventFormat.forEach(round => {
            t.teamScores.push(round)
        });
        se.eventTeamScores.push(t)
    }
}

export function clearEventRounds(id: number) {
    let se = shootEvents.find((e) => e.eventId === id)
    if(se) se.eventFormat = []
    se?.eventTeamScores.forEach(team => {
        team.teamScores = []
    });
}

export function clearEventTeams(id: number) {
    let se = shootEvents.find((e) => e.eventId === id)
    if(se) se.eventTeamScores = []
}

export function removeShootEvent(id: number) {
    shootEvents = shootEvents.filter((shootEvent) => shootEvent.eventId != id);
}

export function clearShootEvents() {
    shootEvents = [];
}

export function getShootEvents() {
    return shootEvents;
}
export function getShootEventById(id: number) : ShootEvent | undefined{
    return shootEvents.find((e) => e.eventId === id);
}