<script lang="ts">
	import type { prismaShootEvent, prismaEventRound } from '$lib/shared/utils';
	import TeamData from './TeamData.svelte';
	import EventHeading from './EventHeading.svelte';
    export let shootEvent: prismaShootEvent;
    export let eventRounds: prismaEventRound[];
    export let screenSize: number;
	let totalClays: number;
    let roundLen = eventRounds.length;
	let shootingIndex: number = 0;

    $: eventComplete = false;
	$: if (shootEvent.eventState === 'COMPLETE') eventComplete = true;
	$: allRoundsComplete = false;
	$: onDeckTeamName = 'n/a';
	$: scoringDisabled = false;
	$: shootingIndex = eventRounds.findIndex((p) => p.roundState !== 'COMPLETE');
	$: shootingTeamId = eventRounds[0].teamId;
	$: shootingTeamName = shootEvent.eventTeamScores[0].teamName;
	$: shootingTeamTotal = 0;
	$: shootingTeamShotsFired = 0;
	$: shootingTeamRoundId = eventRounds[0].id;
	$: shootingTeamRoundName = eventRounds[0].roundName;
	$: onDeckTeamId = eventRounds[1].teamId;
	$: roundAmmo = eventRounds[0].roundAmmo;
	$: roundClays = eventRounds[0].roundClays;
	$: eventWinner = shootEvent.eventTeamScores[0];
	$: winnerClayAccuracy = 0;
	$: winnerAmmoAccuracy = 0;
	$: sRound = eventRounds[shootingIndex];
	$: pRound = eventRounds[shootingIndex - 1];
	$: oRound = eventRounds[shootingIndex + 1];
	
	$: if (shootingIndex === -1) {
		allRoundsComplete = true;
		onDeckTeamName = 'All Rounds Complete';
		shootingTeamId = shootEvent.eventTeamScores[0].teamId
		shootingTeamName = shootEvent.eventTeamScores[0].teamName + ' | ' + shootEvent.eventTeamScores[0].teamShooter1 + ' - ' + shootEvent.eventTeamScores[0].teamShooter2;
		if (eventWinner.teamTotal !== null && eventWinner.teamShotsFired !== null) {
			winnerClayAccuracy = Math.round((eventWinner.teamTotal / totalClays) * 100);
			winnerAmmoAccuracy = Math.round((eventWinner.teamTotal / eventWinner.teamShotsFired) * 100);
		}
		scoringDisabled = true;
	} else {
		allRoundsComplete = false;
		sRound = eventRounds[shootingIndex];
		if (shootingIndex + 1 === roundLen) {
			onDeckTeamName = 'Final Round';
			onDeckTeamId = -1;
		} else {
			oRound = eventRounds[shootingIndex + 1];
			if (oRound !== undefined) {
				onDeckTeamId = oRound.teamId;
			}
			let oTeam = shootEvent.eventTeamScores.find((x) => x.id === onDeckTeamId);
			if (oTeam !== undefined) onDeckTeamName = oTeam.teamName + ' | ' + oTeam.teamShooter1 + ' - ' + oTeam.teamShooter2;
		}
		if (shootingIndex > 0) {
			pRound = eventRounds[shootingIndex - 1];
		} 
		if (sRound !== undefined) {
			shootingTeamId = sRound.teamId;
			let sTeam = shootEvent.eventTeamScores.find((x) => x.id === shootingTeamId);
			if (sTeam !== undefined)
				shootingTeamName = sTeam.teamName + ' | ' + sTeam.teamShooter1 + ' - ' + sTeam.teamShooter2;
			shootingTeamRoundId = sRound.id;
			shootingTeamRoundName = sRound.roundName;
			roundAmmo = sRound.roundAmmo;
			roundClays = sRound.roundClays;
			shootingTeamShotsFired = eventRounds
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
</script>
<EventHeading dbShootEvent={shootEvent} sRound={sRound} shootingTeamName={shootingTeamName} onDeckTeamName={onDeckTeamName} eventWinner={eventWinner}/>
<div class="flex-col my-auto min-w-[390px]">
    {#each shootEvent.eventTeamScores as ets}
        {#if screenSize > 1365}
            <div><TeamData teamData={ets} orientation="horizontal"/></div>
        {:else}
            <div><TeamData teamData={ets} orientation="vertical"/></div>
        {/if}
    {/each}
</div>
