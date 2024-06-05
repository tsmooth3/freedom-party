import { events } from 'sveltekit-sse'
import { json } from '@sveltejs/kit';

const delay = (milliseconds: number) => new Promise(r => setTimeout(r, milliseconds))

export function GET({ params }) {
    const eventId = Number( params.eventId) 
    return events(async emit => {
        while (true) {
            const eventRounds = await prisma.eventRound.findMany({
                where: {
                    eventId: {
                        equals: eventId
                    }
                },
                orderBy: [
                    {
                        roundIndex: 'asc'
                    },
                    {
                        teamId: 'asc'
                    }
                ]
            })
            const shootEvent = await prisma.shootEvent.findFirst({
                where: {
                    id: eventId
                },
                include: {
                    eventTeamScores: {
                        orderBy: [
                            { teamTotal: 'desc' },
                            { teamShotsFired: 'asc' }
                        ],
                        include: {
                            teamScores: {
                                orderBy: {
                                    roundIndex: 'asc'
                                }
                            }
                        }
                    }
                }
            })
            const dbShootEvents = await prisma.shootEvent.findMany({
                where: {
                    id: eventId
                },
                include: {
                    eventTeamScores: {
                        orderBy: [
                            { teamTotal: 'desc' },
                            { teamShotsFired: 'asc' }
                        ],
                        include: {
                            teamScores: {
                                orderBy: {
                                    roundIndex: 'asc'
                                }
                            }
                        }
                    }
                }
            })

            let roundLen = eventRounds.length;
            let onDeckTeamName = 'FinalRound';
            let shootingTeamId = -1;
            let allRoundsComplete = false;
            let shootingTeamRoundId = -1;
            let shootingTeamRoundName = "";
            let onDeckTeamId = -1;
            let totalClays = 0;
            let eventWinner = dbShootEvents[0].eventTeamScores[0];
            let winnerAmmoAccuracy = 0;
            let winnerClayAccuracy = 0;
            let scoringDisabled = false;
            let shootingTeamName = "";
            let shootingTeamTotal = 0;
            let shootingTeamShotsFired = 0;

            const shootingIndex = eventRounds.findLastIndex((p) => p.roundState === 'COMPLETE');
            if (shootingIndex + 1 === roundLen) {
                allRoundsComplete = true;
                onDeckTeamName = 'All Rounds Complete';
                shootingTeamId = eventRounds[0].teamId;
                shootingTeamRoundId = eventRounds[shootingIndex].id;
                shootingTeamRoundName = eventRounds[shootingIndex].roundName;
                onDeckTeamId = eventRounds[1].teamId;
                totalClays = eventRounds
                    .filter(
                        (score) =>
                            score.teamId === shootingTeamId &&
                            (score.roundState === 'COMPLETE' || score.roundState === 'ACTIVE')
                    )
                    .reduce((count, score) => {
                        if (score.roundClays) {
                            // Use regular expression to count occurrences of "x"
                            const xCount = (score.roundClays || []).length;
                            count += xCount;
                        }
                        return count;
                    }, 0);
                if (eventWinner.teamTotal !== null && eventWinner.teamShotsFired !== null) {
                    winnerClayAccuracy = Math.round((eventWinner.teamTotal / totalClays) * 100);
                    winnerAmmoAccuracy = Math.round((eventWinner.teamTotal / eventWinner.teamShotsFired) * 100);
                }
            } else {
                allRoundsComplete = false;
                let sRound = eventRounds[shootingIndex + 1];
                if (shootingIndex + 2 === roundLen) {
                    onDeckTeamName = 'Final Round';
                    onDeckTeamId = -1;
                } else {
                    let oRound = eventRounds[shootingIndex + 2];
                    if (oRound !== undefined) {
                        onDeckTeamId = oRound.teamId;
                    }
                    let oTeam = dbShootEvents[0].eventTeamScores.find(
                        (x) => x.id === onDeckTeamId
                    )?.teamName;
                    if (oTeam !== undefined) onDeckTeamName = oTeam;
                }
                if (sRound !== undefined) {
                    shootingTeamId = sRound.teamId;
                    let sTeam = dbShootEvents[0].eventTeamScores.find((x) => x.id === shootingTeamId);
                    if (sTeam !== undefined)
                        shootingTeamName = sTeam.teamName + ' | ' + sTeam.teamShooter1 + ' - ' + sTeam.teamShooter2;
                    shootingTeamRoundId = sRound.id;
                    shootingTeamRoundName = sRound.roundName;
                    shootingTeamShotsFired =eventRounds
                        .filter(
                            (score) =>
                                score.teamId === shootingTeamId &&
                                (score.roundState === 'COMPLETE' || score.roundState === 'ACTIVE')
                        )
                        .reduce((count, score) => {
                            if (score.roundAmmo) {
                                // Use regular expression to count occurrences of "x"
                                const xCount = (score.roundAmmo.match(/[xo]/g) || []).length;
                                count += xCount;
                            }
                            return count;
                        }, 0);
                    shootingTeamTotal = eventRounds
                        .filter(
                            (score) =>
                                score.teamId === shootingTeamId &&
                                (score.roundState === 'COMPLETE' || score.roundState === 'ACTIVE')
                        )
                        .reduce((count, score) => {
                            if (score.roundClays) {
                                // Use regular expression to count occurrences of "x"
                                const xCount = (score.roundClays.match(/x/g) || []).length;
                                count += xCount;
                            }
                            return count;
                        }, 0);
                    totalClays = eventRounds
                        .filter(
                            (score) =>
                                score.teamId === shootingTeamId &&
                                (score.roundState === 'COMPLETE' || score.roundState === 'ACTIVE')
                        )
                        .reduce((count, score) => {
                            if (score.roundClays) {
                                // Use regular expression to count occurrences of "x"
                                const xCount = (score.roundClays || []).length;
                                count += xCount;
                            }
                            return count;
                        }, 0);
                }
            }
            emit('dbShootEvents', JSON.stringify(dbShootEvents, null))
            emit('allRoundsComplete', allRoundsComplete.toString())
            emit('eventName', dbShootEvents[0].eventName)
            emit('ShootingTeamRoundName', shootingTeamRoundName)
            emit('ShootingTeamName', shootingTeamName)
            emit('onDeckTeamName', onDeckTeamName)
            emit('ShootingTeamTotal', shootingTeamTotal.toString())
            emit('ShootingTeamShotsFired', shootingTeamShotsFired.toString())
            await delay(2000)
        }
    }).toResponse()
}