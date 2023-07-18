export type ShootEvent = {
    eventId: number
    eventDate: Date
    eventActive: boolean
    eventComplete: boolean
    eventFormat: EventRound[]
    eventTeamScores: TeamScore[]
}
export type EventRound = {
    roundId: number
    roundName: string
    roundClays: string
    roundAmmo: string
    roundActive: boolean
    roundComplete: boolean
}
export type TeamScore = {
    teamId: number
    teamName: string
    shooter1: string
    shooter2: string
    roundScores: EventRound[]
}

let startUp = Date.now()

let shootEvents: ShootEvent[] = [
    {
        eventId: startUp,
        eventDate: new Date(),
        eventActive: false,
        eventComplete: false,
        eventFormat: [],
        eventTeamScores: []
    }
]

let round1: EventRound = {
    roundId: 1,
    roundName: "Round 1",
    roundActive: false,
    roundComplete: false,
    roundAmmo: '----',
    roundClays: '--',
}
let round2: EventRound = {
    roundId: 2,
    roundName: "Round 2",
    roundActive: false,
    roundComplete: false,
    roundAmmo: '----',
    roundClays: '--',
}
let team1: TeamScore = {
    teamId: 1,
    teamName: 'Freedom Frogs',
    shooter1: 'Scott',
    shooter2: 'Tim',
    roundScores: [],
}
let team2: TeamScore = {
    teamId: 2,
    teamName: 'Burt Squared',
    shooter1: 'Burt Sr.',
    shooter2: 'Burt Jr.',
    roundScores: [],
}

addRoundToEvent(startUp,round1)
addTeamToEvent(startUp, team1)
addRoundToEvent(startUp,round2)
addTeamToEvent(startUp, team2)

export function addShootEvent(se: ShootEvent) {
    const shootEvent: ShootEvent = {
        eventId: se.eventId,
        eventDate: se.eventDate,
        eventActive: se.eventActive,
        eventComplete: se.eventComplete,
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
            if(se) team.roundScores = se.eventFormat
        })
    }
}

export function addTeamToEvent(id: number, t: TeamScore) {
    let se = shootEvents.find((e) => e.eventId === id)
    if(se){
        se.eventFormat.forEach(round => {
            t.roundScores.push(round)
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