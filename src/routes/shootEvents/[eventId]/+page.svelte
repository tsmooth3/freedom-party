<script lang="ts">
	import TeamData from '$lib/components/TeamData.svelte';
	import { myStationAmmo, myStationClays, allStations, myTeamShotsFired, myTeamTotal, allStationAmmos, allStationClays } from '$lib/client/localStoragedb';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import cap from '$lib/images/capshield.svg';
	import shell from '$lib/images/shell.svg';
	import doglaugh from '$lib/images/doglaugh.gif';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import ScoringCard from '$lib/components/ScoringCard.svelte';
	let screenSize: number;
	export let data: PageData;

	let eventId: number;
	let shootingTeamId: number;
	let shootingTeamRoundId: number;
	let shootingTeamStationId: number;
	let roundIndex: number = 0;
	let roundLen: number = 0;
	let shootingIndex: number = 0;
	let stationLen: number = 0;
	let onDeckTeamId: number;
	let completeRoundOnSubmit: boolean = false;
	
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
	
	let shootingTeamRoundName: string;
	let shootingTeamPresentationName: string;
	let eventComplete: boolean = false;
	let scoringDisabled:boolean = false;
	let allRoundsComplete: boolean = false;
	let shootingTeamName: string;
	let onDeckTeamName: string;
	let shootingTeamShotsFired: number = 0;
	let shootingTeamTotal: number = 0;
	let totalClays: number = 0;
	let winnerClayAccuracy: number = 0;
	let winnerAmmoAccuracy: number = 0;

	let roundAmmo: string;
	let roundClays: string;
	
	$: if (data.dbShootEvents[0].eventState === 'COMPLETE') eventComplete = true;
	$: shootingTeamName = data.dbShootEvents[0].eventTeamScores[0].teamName;
	$: eventWinner = data.dbShootEvents[0].eventTeamScores[0];
	$: eventId = data.dbShootEvents[0].id;
	
	$: if (data.dbEventRounds){
		// find the first round that is NEW or ACTIVE
		roundIndex  = data.dbEventRounds.findIndex((p) => p.roundState === 'NEW' || p.roundState === 'ACTIVE');
		// find the total number of rounds
		roundLen = data.dbEventRounds.length;
		completeRoundOnSubmit = false;
	}
	
	$: if (roundIndex === -1) {
		allRoundsComplete = true;
		onDeckTeamName = 'All Rounds Complete';
		totalClays = data.dbEventRounds
		.filter(
			(score) =>
			(score.teamId === eventWinner.id) &&
			(score.roundState === 'COMPLETE')
		)
		.reduce((count, score) => {
			if (score.roundClays) {
				// Use regular expression to count occurrences of "x|o"
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
		// get the current round
		let sRound = data.dbEventRounds[roundIndex];
		shootingTeamId = sRound.teamId;
		shootingTeamRoundId = sRound.id;
		onDeckTeamId = sRound.teamId;
		shootingTeamRoundName = sRound.roundName;

		// find the first station that is not COMPLETE or has stationClays that match '-'
		shootingIndex = sRound.roundStationFormat.findIndex((p) => p.stationState !== 'COMPLETE' || p.stationClays?.includes('-'));

		stationLen = sRound.roundStationFormat.length;
		shootingTeamStationId = sRound.roundStationFormat[shootingIndex].id;
		shootingTeamPresentationName = sRound.roundStationFormat[shootingIndex].presentationName;
		
		if (shootingIndex === stationLen - 1){
			completeRoundOnSubmit = true;
		}
		if (roundIndex === roundLen - 1) {
			onDeckTeamName = 'Final Round';
			onDeckTeamId = -1;
		} else {
			let oRound = data.dbEventRounds[roundIndex + 1];
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
			$myStationClays = sRound.roundStationFormat[shootingIndex].stationClays;
			$myStationAmmo = sRound.roundStationFormat[shootingIndex].stationAmmo;
			$allStations = sRound.roundStationFormat.map(s => 
				s.presentationName + ',' + s.stationClays + ',' + s.stationAmmo
			).join('|');
			// concatenate all station ammos and clays where stationState is COMPLETE
			$allStationAmmos = sRound.roundStationFormat
				.filter( s => s.stationState === 'COMPLETE')
				.map( s => s.stationAmmo ?? '').join('');
			$allStationClays = sRound.roundStationFormat
				.filter( s => s.stationState === 'COMPLETE')
				.map( s => s.stationClays ?? '').join('');
			

			shootingTeamShotsFired = data.dbEventRounds
				.filter(
					(score) =>
						score.teamId === shootingTeamId 
				)
				.reduce((count, score) => {
					score.roundStationFormat.forEach(station => {
						if (station.stationAmmo) {
							// Use regular expression to count occurrences of "xo"
							const xCount = (station.stationAmmo.match(/[xo]/g) || []).length;
							count += xCount;
						}
					});
					return count;
				}, 0);
			$myTeamShotsFired = shootingTeamShotsFired;
			shootingTeamTotal = data.dbEventRounds
				.filter(
					(score) =>
						score.teamId === shootingTeamId
				)
				.reduce((count, score) => {
						score.roundStationFormat.forEach(station => {
							if (station.stationClays) {
								// Use regular expression to count occurrences of "x"
								const xCount = (station.stationClays.match(/x/g) || []).length;
								count += xCount;
							}
						});
					return count;
				}, 0);
			$myTeamTotal = shootingTeamTotal;
			totalClays = data.dbEventRounds
				.filter(
					(score) =>
						score.teamId === shootingTeamId 
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
	}

	function kill(value: number) {
		const len = $myStationClays.length;
		const ammoLen = $myStationAmmo.length;
		if (len < 2 || len > 4 || value < 0 || value > 4) return;
		
		// Create a string with 'value' number of 'x's followed by 'o's to fill the length
		$myStationClays = 'x'.repeat(value) + 'o'.repeat(len - value);
		// assume the same for ammo 
		$myStationAmmo = 'x'.repeat(value) + '-'.repeat(ammoLen - value);
	}
	function shot(count: number) {
		const len = $myStationClays.length;
		if (len < 2 || len > 4 || count < 1 || count > 4) return;
		
		// Build the ammo pattern based on hits and shot count
		let ammoPattern = '';
		if ($myStationClays === 'xx'){
			if (count == 1){ return;}
			if (count == 2){ ammoPattern = 'xx--';}
			if (count == 3){ ammoPattern = 'xxo-';}
			if (count == 4){ ammoPattern = 'xxoo';}
		} else if ($myStationClays === 'xo'){
			if (count == 1){ ammoPattern = 'x---';}
			if (count == 2){ ammoPattern = 'xo--';}
			if (count == 3){ ammoPattern = 'xoo-';}
			if (count == 4){ ammoPattern = 'xooo';}
		} else if ($myStationClays === 'oo'){
			if (count == 1){ ammoPattern = 'o---';}
			if (count == 2){ ammoPattern = 'oo--';}
			if (count == 3){ ammoPattern = 'ooo-';}
			if (count == 4){ ammoPattern = 'oooo';}
		} else if ($myStationClays === 'xxx'){
			if (count == 1){ return;}
			if (count == 2){ return;}
			if (count == 3){ ammoPattern = 'xxx-';}
			if (count == 4){ ammoPattern = 'xxxo';}
		} else if ($myStationClays === 'xxo'){
			if (count == 1){ return;}
			if (count == 2){ ammoPattern = 'xx--';}
			if (count == 3){ ammoPattern = 'xxo-';}
			if (count == 4){ ammoPattern = 'xxoo';}
		} else if ($myStationClays === 'xoo'){
			if (count == 1){ ammoPattern = 'x---';}
			if (count == 2){ ammoPattern = 'xo--';}
			if (count == 3){ ammoPattern = 'xoo-';}
			if (count == 4){ ammoPattern = 'xooo';}
		} else if ($myStationClays === 'ooo'){
			if (count == 1){ ammoPattern = 'o---';}
			if (count == 2){ ammoPattern = 'oo--';}
			if (count == 3){ ammoPattern = 'ooo-';}
			if (count == 4){ ammoPattern = 'oooo';}
		} else if ($myStationClays === 'xxxx'){
			if (count == 1){ return;}
			if (count == 2){ return;}
			if (count == 3){ return;}
			if (count == 4){ ammoPattern = 'xxxx';}
		} else if ($myStationClays === 'xxxo'){
			if (count == 1){ return;}
			if (count == 2){ return;}
			if (count == 3){ ammoPattern = 'xxx-';}
			if (count == 4){ ammoPattern = 'xxxo';}
		} else if ($myStationClays === 'xxoo'){
			if (count == 1){ return;}
			if (count == 2){ ammoPattern = 'xx--';}
			if (count == 3){ ammoPattern = 'xxo-';}
			if (count == 4){ ammoPattern = 'xxoo';}
		} else if ($myStationClays === 'xooo'){
			if (count == 1){ ammoPattern = 'x---';}
			if (count == 2){ ammoPattern = 'xo--';}
			if (count == 3){ ammoPattern = 'xoo-';}
			if (count == 4){ ammoPattern = 'xooo';}
		} else if ($myStationClays === 'oooo'){
			if (count == 1){ ammoPattern = 'o---';}
			if (count == 2){ ammoPattern = 'oo--';}
			if (count == 3){ ammoPattern = 'ooo-';}
			if (count == 4){ ammoPattern = 'oooo';}
		}		

		$myStationAmmo = ammoPattern;

		$myTeamShotsFired = shootingTeamShotsFired + $myStationAmmo.replaceAll('-', '').length;
		$myTeamTotal = shootingTeamTotal + $myStationClays.replaceAll('-', '').replaceAll('o', '').length;
	}

	function undo() {
		$myStationAmmo = $myStationAmmo.replaceAll('x', '-').replaceAll('o', '-');
		$myStationClays = $myStationClays.replaceAll('x', '-').replaceAll('o', '-');
		$myTeamShotsFired = shootingTeamShotsFired;
		$myTeamTotal = shootingTeamTotal;
	}
</script>

<svelte:window bind:innerWidth={screenSize} />

{#await data}
	<p>Loading ...</p>
{:then data}
	<!-- <pre>
		eventId: {data.dbShootEvents[0].id}
		ShootingTeamId: {shootingTeamId}
		ShootingTeamRoundId: {shootingTeamRoundId}
		ShootingTeamStationId: {shootingTeamStationId}
		roundIndex: {roundIndex} / {data.dbEventRounds.length}
		shootingIndex: {shootingIndex} / {stationLen}
		completeRoundOnSubmit: {completeRoundOnSubmit}
		onDeckTeamId: {onDeckTeamId}
		roundClays: {roundClays}
		roundAmmo: {roundAmmo}
		myStationAmmo: {$myStationAmmo}
		myStationClays: {$myStationClays}
		myTeamTotal: {$myTeamTotal}
		myTeamShotsFired: {$myTeamShotsFired}
		allStations: {$allStations}
		allStationAmmos: {$allStationAmmos}
		allStationClays: {$allStationClays}
	</pre> -->
	<div class="flex-1 my-auto min-w-[390px] justify-center">
		<form method="POST" action="?/submitStation" use:enhance>
			<input type="hidden" name="eventId" value={data.dbShootEvents[0].id} />
			<input type="hidden" name="teamId" value={shootingTeamId} />
			<input type="hidden" name="roundId" value={shootingTeamRoundId} />
			<input type="hidden" name="roundStationId" value={shootingTeamStationId} />
			<input type="hidden" name="stationAmmo" bind:value={$myStationAmmo} />
			<input type="hidden" name="stationClays" bind:value={$myStationClays} />
			<input type="hidden" name="teamTotal" bind:value={$myTeamTotal} />
			<input type="hidden" name="teamShotsFired" bind:value={$myTeamShotsFired} />
			<input type="hidden" name="teamId2" value={onDeckTeamId} />
			<input type="hidden" name="roundAmmo" bind:value={$allStationAmmos} />
			<input type="hidden" name="roundClays" bind:value={$allStationClays} />
			<input type="hidden" name="completeRound" bind:value={completeRoundOnSubmit} />
			{#if data.dbShootEvents[0].eventState === 'NEW'}
				<button
					formaction="?/startEvent"
					type="submit"
					class="btn w-full variant-outline-primary variant-ghost-primary">Start Event</button
				>
			{:else if eventComplete || allRoundsComplete}
				<div class="flex my-auto min-w-[390px]">
					<div class="card m-3 p-3 flex-auto variant-ghost-success text-center">
						<div class="h2">{eventName}</div>
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
				{#if eventComplete != true}
					<button disabled={eventComplete} formaction="?/completeEvent" type="submit" class="btn w-full variant-outline-success variant-ghost-primary">Complete Event</button>
				{/if}
			{:else}
				<div class="flex my-auto min-w-[390px]">
					<div class="card m-3 p-3 flex-auto variant-ringed-secondary text-center">
						<div class="h2">{eventName}</div>
						<div class="h3">{formattedDate}</div>
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
							<ScoringCard
								roundName={shootingTeamRoundName}
								presentationName={shootingTeamPresentationName}
								stationAmmos={$myStationAmmo}
								stationClays={$myStationClays}
								allStations={$allStations}
							/>
						</div>
						<div class="flex-auto">
							<div class="flex m-1 justify-start">
								<button type="button" class="p-2 m-2 w-full btn variant-ghost-error" on:click={() => kill(0)}>0<img class="mx-2 w-6 md:w-8 lg:w-10" src={cap} alt="clay" /></button>
								<button type="button" class="p-2 m-2 w-full btn variant-ghost-error" on:click={() => kill(1)}>1<img class="mx-2 w-6 md:w-8 lg:w-10" src={cap} alt="clay" /></button>
								<button type="button" class="p-2 m-2 w-full btn variant-ghost-error" on:click={() => kill(2)}>2<img class="mx-2 w-6 md:w-8 lg:w-10" src={cap} alt="clay" /></button>
								<button type="button" class="p-2 m-2 w-full btn variant-ghost-error" on:click={() => kill(3)} disabled={$myStationClays.length < 3}>3<img class="mx-2 w-6 md:w-8 lg:w-10" src={cap} alt="clay" /></button>
								<button type="button" class="p-2 m-2 w-full btn variant-ghost-error" on:click={() => kill(4)} disabled={$myStationClays.length < 4}>4<img class="mx-2 w-6 md:w-8 lg:w-10" src={cap} alt="clay" /></button>
							</div>
							<div class="flex m-1 justify-start">
								<button type="button" class="p-1 m-1 w-full btn variant-ghost-warning" disabled={$myStationClays.includes('-')} on:click={() => shot(1)}>1<img class="mx-2 h-6 md:h-8 lg:h-10" src={shell} alt="shell" /></button>
								<button type="button" class="p-1 m-1 w-full btn variant-ghost-warning" disabled={$myStationClays.includes('-')} on:click={() => shot(2)}>2<img class="mx-2 h-6 md:h-8 lg:h-10" src={shell} alt="shell" /></button>
								<button type="button" class="p-1 m-1 w-full btn variant-ghost-warning" disabled={$myStationClays.includes('-')} on:click={() => shot(3)}>3<img class="mx-2 h-6 md:h-8 lg:h-10" src={shell} alt="shell" /></button>
								<button type="button" class="p-1 m-1 w-full btn variant-ghost-warning" disabled={$myStationClays.includes('-')} on:click={() => shot(4)}>4<img class="mx-2 h-6 md:h-8 lg:h-10" src={shell} alt="shell" /></button>
							</div>
							<div class="flex m-1 justify-start">
								<button type="button" class="m-2 w-full btn variant-ghost-secondary" on:click={undo}>reset 🔄️</button>
								<button type="submit" class="m-2 w-full btn variant-outline-primary" disabled={!$myStationAmmo.match('x|o')}>Submit</button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</form>
	</div>
	

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
	<div class="flex my-auto min-w-[390px]">
		<img class="flex-1 mx-auto min-w-[390px] max-w-[690px]" src={doglaugh} alt="duck hunt dog" />
	</div>
{:catch error}
	<p>{error.message}</p>
{/await}
