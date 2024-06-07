<script lang="ts">
	import TeamData from '$lib/components/TeamData.svelte';
	import { myAmmo, myClays, myTeamShotsFired, myTeamTotal } from '$lib/client/localStoragedb';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import cap from '$lib/images/capshield.svg';
	import clayhit from '$lib/images/capshield_broken.svg';
	import claymiss from '$lib/images/capshield_miss.svg';
	import shellhit from '$lib/images/shell_shot.svg';
	import shellmiss from '$lib/images/shellshot.svg';
	import doglaugh from '$lib/images/doglaugh.gif';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import type { EventState } from '$lib/shared/utils';
	import RoundVertical from '$lib/components/RoundVertical.svelte';
	let screenSize: number;
	export let data: PageData;
	let roundLen = data.dbEventRounds.length;
	let teamState: EventState = 'IDLE';
	let shootingIndex: number = 0;

	let eventName: String = data.dbShootEvents[0].eventName;
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'America/New_York'
	};
	let eventDate: Date = data.dbShootEvents[0].createdAt;
	const inputDate = new Date(eventDate);
	const formatter = new Intl.DateTimeFormat('en-US', options);
	const formattedDate = formatter.format(inputDate);
	let shootingTeamRoundId: number;
	let shootingTeamId: number;
	let onDeckTeamId: number;
	let shootingTeamRoundName: string;
	let roundAmmo: string;
	let roundClays: string;
	$: eventComplete = false;
	$: if (data.dbShootEvents[0].eventState === 'COMPLETE') eventComplete = true;
	$: allRoundsComplete = false;
	$: onDeckTeamName = 'n/a';
	$: scoringDisabled = false;
	$: if (data.dbEventRounds){
		shootingIndex = data.dbEventRounds.findLastIndex((p) => p.roundState === 'COMPLETE');
		roundLen = data.dbEventRounds.length;
		shootingTeamId = data.dbEventRounds[0].teamId;
		shootingTeamRoundId = data.dbEventRounds[0].id;
		shootingTeamRoundName = data.dbEventRounds[0].roundName;
		onDeckTeamId = data.dbEventRounds[1].teamId;
		roundAmmo = data.dbEventRounds[0].roundAmmo;
		roundClays = data.dbEventRounds[0].roundClays;
	}
	$: shootingTeamName = data.dbShootEvents[0].eventTeamScores[0].teamName;
	$: shootingTeamTotal = 0;
	$: shootingTeamShotsFired = 0;
	$: totalClays = 0;
	$: eventWinner = data.dbShootEvents[0].eventTeamScores[0];
	$: winnerClayAccuracy = 0;
	$: winnerAmmoAccuracy = 0;

	$: if (shootingIndex + 1 === roundLen) {
		allRoundsComplete = true;
		onDeckTeamName = 'All Rounds Complete';
		shootingTeamId = data.dbEventRounds[0].teamId;
		shootingTeamRoundId = data.dbEventRounds[shootingIndex].id;
		shootingTeamRoundName = data.dbEventRounds[shootingIndex].roundName;
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
			let sTeam = data.dbShootEvents[0].eventTeamScores.find((x) => x.id === shootingTeamId);
			if (sTeam !== undefined)
				shootingTeamName = sTeam.teamName + ' | ' + sTeam.teamShooter1 + ' - ' + sTeam.teamShooter2;
			shootingTeamRoundId = sRound.id;
			shootingTeamRoundName = sRound.roundName;
			roundAmmo = sRound.roundAmmo;
			roundClays = sRound.roundClays;
			$myAmmo = sRound.roundAmmo;
			$myClays = sRound.roundClays;
			shootingTeamShotsFired = data.dbEventRounds
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
			$myTeamShotsFired = shootingTeamShotsFired;
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
			$myTeamTotal = shootingTeamTotal;
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
	}

	$: if (allRoundsComplete) {
		scoringDisabled = true;
	} else {
		if ($myAmmo.includes('-') && $myClays.includes('-')) {
			scoringDisabled = false;
		} else {
			scoringDisabled = true;
		}
	}

	function kill() {
		if ($myAmmo.includes('-') && $myClays.includes('-')) {
			$myAmmo = $myAmmo.replace('-', 'x');
			$myTeamShotsFired++;
			$myClays = $myClays.replace('-', 'x');
			$myTeamTotal++;
		}
		if (!$myAmmo.includes('-')) {
			$myClays = $myClays.replaceAll('-', 'o');
		}
	}
	function shot() {
		if ($myAmmo.includes('-')) {
			$myAmmo = $myAmmo.replace('-', 'o');
			$myTeamShotsFired++;
		}
		if (!$myAmmo.includes('-')) {
			$myClays = $myClays.replaceAll('-', 'o');
		}
	}
	function lost() {
		$myClays = $myClays.replace('-', 'o');
	}

	function undo() {
		$myAmmo = $myAmmo.replaceAll('x', '-').replaceAll('o', '-');
		$myClays = $myClays.replaceAll('x', '-').replaceAll('o', '-');
		$myTeamShotsFired = shootingTeamShotsFired;
		$myTeamTotal = shootingTeamTotal;
	}
</script>

<svelte:window bind:innerWidth={screenSize} />

{#await data}
	<p>Loading ...</p>
{:then data}
	<div class="flex p-1 min-w-[390px] justify-end">
		<form method="POST" action="?/completeRound" use:enhance>
			<input type="hidden" name="eventId" value={data.dbShootEvents[0].id} />
			<input type="hidden" name="teamState" value={teamState} />
			<input type="hidden" name="teamTotal" bind:value={$myTeamTotal} />
			<input type="hidden" name="teamShotsFired" bind:value={$myTeamShotsFired} />
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
				<input type="hidden" name="roundAmmo" bind:value={$myAmmo} />
				<input type="hidden" name="roundClays" bind:value={$myClays} />
				{#if scoringDisabled}
					{#if allRoundsComplete}
						<button formaction="?/completeEvent" type="submit" class="btn variant-outline"
							>Complete Event</button>
					{:else}
						<button type="submit" class="btn variant-outline">Complete Round</button>
					{/if}
				{/if}
			{/if}
		</form>
	</div>
	<!-- <pre>
		{data.dbShootEvents[0].eventName}
		ShootingTeamId: {shootingTeamId}
		ShootingTeamName: {shootingTeamName}
		ShootingTeamRoundName: {shootingTeamRoundName}
		ShootingTeamRoundId: {shootingTeamRoundId}
		onDeckTeamId: {onDeckTeamId}
		myClays: {$myClays} : {$myClays.includes('-')}
		myAmmo: {$myAmmo} : {$myAmmo.includes('-')}
		myTeamTotal: {$myTeamTotal}
		myTeamShotsFired: {$myTeamShotsFired}
		scoringDisabled: {scoringDisabled}
		allRoundsComplete: {allRoundsComplete}
		totalClays: {totalClays}
	</pre> -->
	{#if eventComplete}
		<div class="flex my-auto min-w-[390px]">
			<div class="card m-3 p-3 flex-auto variant-ghost-success text-center">
				<h1 class="h1">{eventName}</h1>
				<h3 class="h3">{formattedDate}</h3>
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
	{:else}
		<div class="flex my-auto min-w-[390px]">
			<div class="card m-3 p-3 flex-auto variant-ringed-secondary text-center">
				<h1 class="h1">{eventName}</h1>
				<h3 class="h3">{formattedDate}</h3>
			</div>
		</div>
	{/if}
	{#if allRoundsComplete == false && data.dbShootEvents[0].eventState !== 'NEW'}
		<div class="flex my-auto min-w-[390px]">
			<div class="card font-sans m-3 p-3 flex-auto variant-ringed-primary variant-glass-secondary">
				<div class="h2 mx-2">
					{shootingTeamName}
				</div>
				<div class="mx-2">
					Team Score: {$myTeamTotal}
				</div>
				<div class="mx-2">
					Total Shots Fired: {$myTeamShotsFired}
				</div>
				<div class="my-2 mx-5">
					<RoundVertical
						roundName={shootingTeamRoundName}
						roundState=""
						ammos={$myAmmo}
						clays={$myClays}
					/>
				</div>
				<div class="flex-auto">
					<div class="flex m-1 justify-start">
						<button type="button" class="m-2 w-full btn variant-ghost-warning" on:click={shot}
							>shot miss <img class="mx-2 h-6 md:h-8 lg:h-10" src={shellmiss} alt="shell" /></button
						>
						<button type="button" class="m-2 w-full btn variant-ghost-success" on:click={kill}
							>shot <img class="mx-2 h-6 md:h-8 lg:h-10" src={shellhit} alt="shell" /> kill
							<img class="mx-2 w-6 md:w-8 lg:w-10" src={clayhit} alt="clayhit" /></button
						>
					</div>
					<div class="flex m-1 justify-start">
						<button type="button" class="m-2 w-full btn variant-ghost-error" on:click={lost}
							>clay miss <img
								class="mx-2 w-6 md:w-8 lg:w-10"
								src={claymiss}
								alt="claymiss"
							/></button
						>
						<button type="button" class="m-2 w-full btn variant-ghost-secondary" on:click={undo}
							>reset 🔄️</button
						>
					</div>
				</div>
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
									<TeamData teamData={ets} orientation="horizontal" />
								{:else}
									<TeamData teamData={ets} orientation="vertical" />
								{/if}
							{/each}
						</svelte:fragment>
					</AccordionItem>
				{/each}
			{:else}
				{#each data.dbActiveShootEvents as se}
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
									<TeamData teamData={ets} orientation="horizontal" />
								{:else}
									<TeamData teamData={ets} orientation="vertical" />
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
