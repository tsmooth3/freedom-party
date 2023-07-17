export type ShootEvent = {
    eventId: number
    eventDate: Date
    eventActive: boolean
    eventComplete: boolean
    eventFormat: EventRound[]
    eventTeamScores: TeamScore[]
}
type EventRound = {
    roundId: number
    roundName: string
    roundClays: string
    roundAmmo: string
    roundActive: boolean
    roundComplete: boolean
}
type TeamScore = {
    teamId: number
    teamName: string
    shooter1: string
    shooter2: string
    roundScores: EventRound[]
}


let shootEvents: ShootEvent[] = [
    {
        eventId: Date.now(),
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
let round6: EventRound = {
    roundId: 6,
    roundName: "Shenanigans",
    roundActive: false,
    roundComplete: false,
    roundAmmo: '----',
    roundClays: '----',
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

addRoundToEvent(shootEvents[0],round1)
addRoundToEvent(shootEvents[0],round2)
addRoundToEvent(shootEvents[0],round6)
addTeamToEvent(shootEvents[0], team1)
addTeamToEvent(shootEvents[0], team2)

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

export function addRoundToEvent(se: ShootEvent, ef: EventRound) {
    se.eventFormat.push(ef)
}

export function clearEventRounds(se: ShootEvent) {
    se.eventFormat = []
}

export function clearEventTeams(se: ShootEvent) {
    se.eventTeamScores = []
}

export function addTeamToEvent(se: ShootEvent, t: TeamScore) {
    se.eventFormat.forEach(round => {
        t.roundScores.push(round)
    });
    se.eventTeamScores.push(t)
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