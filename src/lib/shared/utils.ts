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