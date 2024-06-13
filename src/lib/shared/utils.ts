export type EventState = "NEW" | "ACTIVE" | "ONDECK" | "IDLE" | "COMPLETE"
export type fSTATE = "CREATE" | "ROUNDS" | "TEAMS" | "SUMMARY" | "COMPLETE"
export type ShootEvent = {
    eventId: number
    eventDate: Date
    eventName: string
    eventState: EventState
    eventTeams: Team[]
    eventRounds: Round[]
    eventStations: Station[]
}
export type Team = {
    teamId: number
    teamName: string
    teamShooter1: string
    teamShooter2: string
    teamState: EventState
    teamRounds: Round[]
}
export type Round = {
    roundId: number
    roundName: string
    roundAmmo: string
    roundClays: string
    roundAmmoNum: string
    roundClaysNum: string
    roundState: EventState
    roundStations: Station[]
}
export type Station = {
    stationIndex: number
    stationAmmo: number
    stationClays: number
    stationState: EventState
}

export type prismaShootEvent = {
    id: number
    createdAt: Date
    updatedAt: Date
    eventName: string
    eventTeams: prismaTeam[]
    eventRounds: prismaRound[]
    eventStations: prismaStation[]
    eventState: EventState
}
export type prismaTeam = {
    id: number
    eventId: number
    teamName: string
    teamShooter1: string
    teamShooter2: string
    teamTotal: number | null
    teamShotsFired: number | null
    teamScores: prismaRound[]
    teamState: EventState
}

export type prismaRound = {
    id: number
    eventId: number
    teamId: number
    roundName: string
    roundIndex: number
    roundAmmo: string
    roundClays: string
    roundStations: prismaStation[]
    roundState: EventState
}
export type prismaStation = {
    id: number
    eventId: number
    teamId: number
    roundId: number
    stationIndex: number
    stationAmmo: string
    stationClays: string
    stationState: EventState
}