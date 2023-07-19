export type EventState = "NEW" | "ACTIVE" | "ONDECK" | "IDLE" | "COMPLETE"
export type ShootEvent = {
    eventId: number
    eventDate: Date
    eventName: string
    eventState: EventState
    eventFormat: EventRound[]
    eventTeamScores: TeamScore[]
}
export type EventRound = {
    roundId: number
    roundName: string
    roundStations: number
    roundAmmo: string
    roundClays: string
    roundState: EventState
}
export type TeamScore = {
    teamId: number
    teamName: string
    teamShooter1: string
    teamShooter2: string
    teamState: EventState
    teamScores: EventRound[]
}

let startUp = Date.now()

let shootEvents: ShootEvent[] = [
    {
        eventId: startUp,
        eventDate: new Date(),
        eventName: "Freedom_Clays_" + startUp,
        eventState: "NEW",
        eventFormat: [],
        eventTeamScores: []
    }
]

let round1: EventRound = {
    roundId: 1,
    roundName: "Round1",
    roundStations: 3,
    roundAmmo: '------------',
    roundClays: '------',
    roundState: "NEW",
}
let team1: TeamScore = {
    teamId: 1,
    teamName: 'Freedom Frogs',
    teamShooter1: 'Scott',
    teamShooter2: 'Tim',
    teamState: "NEW",
    teamScores: [], 
}

addRoundToEvent(startUp,round1)
addTeamToEvent(startUp, team1)

export function addShootEvent(se: ShootEvent) {
    const shootEvent: ShootEvent = {
        eventId: se.eventId,
        eventDate: se.eventDate,
        eventName: se.eventName,
        eventState: se.eventState,
        eventFormat: se.eventFormat,
        eventTeamScores: se.eventTeamScores
    }
    shootEvents.push(shootEvent);
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