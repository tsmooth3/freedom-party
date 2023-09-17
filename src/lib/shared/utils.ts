export type EventState = "NEW" | "ACTIVE" | "ONDECK" | "IDLE" | "COMPLETE"
export type fSTATE = "CREATE" | "ROUNDS" | "TEAMS" | "SUMMARY" | "COMPLETE"
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
    roundAmmoNum: string
    roundClaysNum: string
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
export type prismaShootEvent = {
    id: number
    createdAt: Date
    updatedAt: Date
    eventName: string
    eventState: EventState
    eventTeamScores: prismaTeamScore[]
}
export type prismaTeamScore = {
    [x: string]: any;
    teamId: number
    eventId: number
    teamName: string
    teamShooter1: string
    teamShooter2: string
    teamState: EventState
    teamTotal: number | null
    teamShotsFired: number | null
    teamScores: prismaEventRound[]
}

export type prismaEventRound = {
    id: number
    eventId: number
    teamId: number
    roundName: string
    roundIndex: number
    roundStations: number
    roundAmmo: string
    roundClays: string
    roundState: EventState
}