<script lang="ts">
	import TeamData from '$lib/components/TeamData.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import cap from '$lib/images/capshield.svg';
	import doglaugh from '$lib/images/doglaugh.gif';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import type { EventState } from '$lib/shared/utils';
	let screenSize: number;
	export let data: PageData;
	let roundLen = data.dbEventRounds.length;
	let teamState: EventState = 'IDLE';
	let shootingIndex: number = 0;

	$: eventComplete = false;
	$: if (data.dbShootEvents[0].eventState === 'COMPLETE') eventComplete = true;
	$: allRoundsComplete = false;
	$: onDeckTeamName = 'n/a';
	$: scoringDisabled = false;
	$: shootingIndex = data.dbEventRounds.findLastIndex((p) => p.roundState === 'COMPLETE');
	$: shootingTeamId = data.dbEventRounds[0].teamId;
	$: shootingTeamTotal = 0;
	$: shootingTeamShotsFired = 0;
	$: shootingTeamRoundId = data.dbEventRounds[0].id;
	$: onDeckTeamId = data.dbEventRounds[1].teamId;
	$: roundAmmo = data.dbEventRounds[0].roundAmmo;
	$: roundClays = data.dbEventRounds[0].roundClays;
	$: totalClays = 0;
	$: eventWinner = data.dbShootEvents[0].eventTeamScores[0];
	$: winnerClayAccuracy = 0;
	$: winnerAmmoAccuracy = 0;

	$: if (shootingIndex + 1 === roundLen) {
		allRoundsComplete = true;
		onDeckTeamName = 'All Rounds Complete';
		shootingTeamId = data.dbEventRounds[0].teamId;
		shootingTeamRoundId = data.dbEventRounds[shootingIndex].id;
		onDeckTeamId = data.dbEventRounds[1].teamId;
		totalClays = data.dbEventRounds
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
		scoringDisabled = true;
	} else {
		allRoundsComplete = false;
		let sRound = data.dbEventRounds[shootingIndex + 1];
		if (shootingIndex + 2 === roundLen) {
			onDeckTeamName = 'Final Round';
			onDeckTeamId = -1;
		} else {
			let oRound = data.dbEventRounds[shootingIndex + 2];
			if (oRound !== undefined) {
				onDeckTeamId = oRound.teamId;
			}
			let oTeam = data.dbShootEvents[0].eventTeamScores.find(
				(x) => x.id === onDeckTeamId
			)?.teamName;
			if (oTeam !== undefined) onDeckTeamName = oTeam;
		}
		if (sRound !== undefined) {
			shootingTeamId = sRound.teamId;
			shootingTeamRoundId = sRound.id;
			roundAmmo = sRound.roundAmmo;
			roundClays = sRound.roundClays;
			shootingTeamShotsFired = data.dbEventRounds
				.filter(
					(score) =>
						score.teamId === shootingTeamId &&
						(score.roundState === 'COMPLETE' || score.roundState === 'ACTIVE')
				)
				.reduce((count, score) => {
					if (score.roundAmmo) {
						// Use regular expression to count occurrences of "x"
						const xCount = (score.roundAmmo.match(/x/g) || []).length;
						count += xCount;
					}
					return count;
				}, 0);
			shootingTeamTotal = data.dbEventRounds
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
			totalClays = data.dbEventRounds
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
		if (roundClays.includes('-') && roundAmmo.includes('-')) {
			scoringDisabled = false;
		} else {
			scoringDisabled = true;
		}
	}
</script>

<svelte:window bind:innerWidth={screenSize} />

{#await data}
	<p>Loading ...</p>
{:then data}
	<div class="flex my-auto p-4 min-w-[390px] justify-end">
		<form method="POST" action="?/completeRound" use:enhance>
			<input type="hidden" name="eventId" value={data.dbShootEvents[0].id} />
			<input type="hidden" name="teamState" value={teamState} />
			<input type="hidden" name="teamTotal" value={shootingTeamTotal} />
			<input type="hidden" name="teamShotsFired" value={shootingTeamShotsFired} />
			<input type="hidden" name="teamId" value={shootingTeamId} />
			<input type="hidden" name="teamId2" value={onDeckTeamId} />
			<input type="hidden" name="teamScoreId" value={shootingTeamRoundId} />
			{#if data.dbShootEvents[0].eventState === 'NEW'}
				<button
					formaction="?/startEvent"
					type="submit"
					class="btn variant-outline-primary variant-ghost-primary">Start Event</button
				>
			{:else if eventComplete}
				<button disabled={true} class="btn variant-outline-success variant-ghost-primary"
					>Event Complete</button
				>
			{:else}
				<input type="hidden" name="roundAmmo" value={roundAmmo} />
				<input type="hidden" name="roundClays" value={roundClays} />
				{#if scoringDisabled}
					{#if allRoundsComplete}
						<button formaction="?/completeEvent" type="submit" class="btn variant-outline"
							>Complete Event</button
						>
					{:else}
						<button type="submit" class="btn variant-outline">Complete Round</button>
					{/if}
				{/if}
				<button formaction="?/undo" type="submit" class="btn variant-outline-tertiary">undo</button>
				{#if !scoringDisabled}
					<button formaction="?/shot" type="submit" class="btn variant-filled-warning">shot</button>
					<button formaction="?/kill" type="submit" class="btn variant-filled-success">kill</button>
					<button formaction="?/lost" type="submit" class="btn variant-filled-error">lost</button>
				{/if}
			{/if}
		</form>
	</div>
	<!-- <pre>
		EventId: {data.dbShootEvents[0].id}
		ShootingTeamId: {shootingTeamId}
		ShootingTeamRoundId: {shootingTeamRoundId}
		onDeckTeamId: {onDeckTeamId}
		roundClays: {roundClays} - {roundClays.includes('-')}
		roundAmmo: {roundAmmo} - {roundAmmo.includes('-')}
		scoringDisabled: {scoringDisabled}
		allRoundsComplete: {allRoundsComplete}
		shootingTeamTotal: {shootingTeamTotal}
		shootingTeamShotsFired: {shootingTeamShotsFired}
		totalClays: {totalClays}
	</pre> -->
	{#if eventComplete}
		<div class="flex my-auto min-w-[390px]">
			<div class="card m-4 p-3 flex-auto variant-ghost-success text-center">
				<h1 class="h1">Event Winner!</h1>
				<h1 class="h1">{eventWinner.teamName}</h1>
				<h2>
					{eventWinner.teamShooter1}
					| {eventWinner.teamShooter2}
				</h2>
				<h2>
					{eventWinner.teamTotal} / {totalClays} Clays Broken |
					{winnerClayAccuracy}% Accuracy
				</h2>
				<h2>
					{eventWinner.teamShotsFired} Shots Fired | {winnerAmmoAccuracy}% Accuracy
				</h2>
			</div>
		</div>
	{/if}
	<div class="flex my-auto min-w-[390px]">
		<Accordion>
			{#if eventComplete}
				{#each data.dbShootEvents as se}
					<AccordionItem>
						<svelte:fragment slot="lead"><img class="h-8" src={cap} alt="cap" /></svelte:fragment>
						<svelte:fragment slot="summary">
							{#if se.eventState === 'NEW'}
								Press Start Event to get started
							{:else if allRoundsComplete || onDeckTeamId == -1}
								<div class="h3">
									{onDeckTeamName}
								</div>
							{:else}
								<div class="h3">
									On Deck: {onDeckTeamName}
								</div>
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="content">
							{#each se.eventTeamScores as ets}
								{#if screenSize > 1368}
									<TeamData teamData={ets} {totalClays} orientation="horizontal" />
								{:else}
									<TeamData teamData={ets} {totalClays} orientation="vertical" />
								{/if}
							{/each}
						</svelte:fragment>
					</AccordionItem>
				{/each}
			{:else}
				{#each data.dbActiveShootEvents as se}
					<AccordionItem open>
						<svelte:fragment slot="lead"><img class="h-8" src={cap} alt="cap" /></svelte:fragment>
						<svelte:fragment slot="summary">
							{#if se.eventState === 'NEW'}
								Press Start Event to get started
							{:else if allRoundsComplete || onDeckTeamId == -1}
								<div class="h3">
									{onDeckTeamName}
								</div>
							{:else}
								<div class="h3">
									On Deck: {onDeckTeamName}
								</div>
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="content">
							{#each se.eventTeamScores as ets}
								{#if screenSize > 1368}
									<TeamData teamData={ets} {totalClays} orientation="horizontal" />
								{:else}
									<TeamData teamData={ets} {totalClays} orientation="vertical" />
								{/if}
							{/each}
						</svelte:fragment>
					</AccordionItem>
				{/each}
			{/if}
		</Accordion>
	</div>
	<!-- <pre>
		{JSON.stringify(data.dbActiveShootEvents[0].eventTeamScores[0], null, 2)}
	</pre> -->
	<div class="flex my-auto min-w-[390px]">
		<img class="flex-1 mx-auto min-w-[390px] max-w-[690px]" src={doglaugh} alt="duck hunt dog" />
	</div>
{:catch error}
	<p>{error.message}</p>
{/await}
