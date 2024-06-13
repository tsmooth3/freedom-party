<script lang="ts">
	import type { Station } from '$lib/shared/utils';
	import { Step, Stepper, tableMapperValues, Table } from '@skeletonlabs/skeleton';
	import { thisEvent, resetShootEvent } from '$lib/client/localStoragedb';
	import shell from '$lib/images/shell.svg';
	import clay from '$lib/images/capshield.svg';
	import { goto } from '$app/navigation';

	let inputStationCount = 3;
	let inputStations: Station[] = [];
	let inputShooters: String[] = [];
	let inputClays = 2;
	let inputAmmo = 4;
	let inputRoundName = 'Round1';
	// let inputTeamName = getRandomTeamName();
	let inputS1 = 'Player 1';
	let inputS2 = 'Player 2';
	
	$: inputTeamName = getRandomTeamName();
	$: stationIndex = 0;
	$: shooterIndex = 1;
	$: roundTable = {
		head: ['Name', 'Stations', 'Clays', 'Ammo'],
		body: tableMapperValues($thisEvent.eventRounds, [
			'roundName',
			'roundStations',
			'roundClaysNum',
			'roundAmmoNum'
		])
	};

	$: teamTable = {
		head: ['Order', 'Team Name', 'Shooter 1', 'Shooter 2'],
		body: tableMapperValues($thisEvent.eventTeams, [
			'teamId',
			'teamName',
			'teamShooter1',
			'teamShooter2'
		])
	};

	function addStation(stationType: number) {
		stationIndex = inputStations.length + 1;
		let stationAmmo: number = 2;
		inputStations = [
			...inputStations,
			{
				stationIndex: stationIndex,
				stationAmmo: stationAmmo,
				stationClays: stationType,
				stationState: 'NEW'
			}
		];
	}

	function addShooter(shooterName: String) {
		if (shooterIndex < 3){

			inputShooters = [
				...inputShooters,
			shooterName
			]
			shooterIndex++
		}
	}

	function resetShooter(){
		inputShooters = [];
		shooterIndex = 1;
	}



	function resetStations(){
		stationIndex = 0;
		inputStations = [];
	}

	function addRound() {
		if (inputRoundName.trim().length === 0)
			inputRoundName = 'Round' + ($thisEvent.eventRounds.length + 1);
		$thisEvent.eventRounds = [
			...$thisEvent.eventRounds,
			{
				roundId: $thisEvent.eventRounds.length + 1,
				roundName: inputRoundName,
				roundAmmo: '-'.repeat(inputStationCount * inputAmmo),
				roundClays: '-'.repeat(inputStationCount * inputClays),
				roundAmmoNum: String(inputStationCount * inputAmmo),
				roundClaysNum: String(inputStationCount * inputClays),
				roundStations: inputStations,
				roundState: 'NEW'
			}
		];
		$thisEvent.eventTeams.forEach((team) => {
			team.teamRounds = $thisEvent.eventRounds;
		});

		stationIndex = 0
		inputRoundName = 'Round' + ($thisEvent.eventRounds.length + 1);
	}
	function undoRound() {
		$thisEvent.eventRounds = $thisEvent.eventRounds.filter(
			(round, roundIndex) => roundIndex !== $thisEvent.eventRounds.length - 1
		);
		$thisEvent.eventTeams.forEach((team) => {
			team.teamRounds = $thisEvent.eventRounds;
		});
		inputRoundName = 'Round' + ($thisEvent.eventRounds.length + 1);
	}
	function addTeam() {
		$thisEvent.eventTeams = [
			...$thisEvent.eventTeams,
			{
				teamId: $thisEvent.eventTeams.length + 1,
				teamName: inputTeamName.trimEnd(),
				teamShooter1: inputS1,
				teamShooter2: inputS2,
				teamState: 'NEW',
				teamRounds: $thisEvent.eventRounds
			}
		];
		inputTeamName = getRandomTeamName();
		inputS1 = 'Player 1';
		inputS2 = 'Player 2';
	}

	function getNewTeamName(){
		inputTeamName = getRandomTeamName();
	
	}
	function getRandomTeamName() {
		const teamNames = [
			"Stars and Stripes",
			"Liberty Legends",
			"Freedom Fighters",
			"American Eagles",
			"Patriots United",
			"Liberty Warriors",
			"Red, White, and Blue Crew",
			"Independence Icons",
			"Bravehearts",
			"Founding Forces",
			"Liberty Leaders",
			"Honor Guard",
			"American Dream Team",
			"Valor Vanguards",
			"Liberty Defenders",
			"The Patriots",
			"Flag Bearers",
			"Liberty Guardians",
			"Liberty Lions",
			"Constitution Crew",
			"Unity Warriors",
			"Freedom Flaggers",
			"Patriotic Pioneers",
			"Stars of Freedom",
			"National Heroes",
			"Liberty Lancers",
			"Eagle Squadron",
			"United We Stand",
			"Freedom Rings",
			"Banner Bearers",
			"Patriot Warriors",
			"Sovereign Sentinels",
			"American Glory",
			"Land of the Free",
			"Victory Vanguards",
			"Justice Juggernauts",
			"Liberty Lightning",
			"Defenders of Freedom",
			"Heritage Heroes",
			"Revolutionary Rulers",
			"Flag Flyers"
		];

		const randomIndex = Math.floor(Math.random() * teamNames.length);
		return teamNames[randomIndex];
	}
	function undoTeam() {
		$thisEvent.eventTeams = $thisEvent.eventTeams.filter(
			(team, teamIndex) => teamIndex !== $thisEvent.eventTeams.length - 1
		);
	}
	let toast: any;
	async function callAddShootEvent() {
		const response = await fetch('api/shootEvents', {
			method: 'POST',
			body: JSON.stringify($thisEvent),
			headers: {
				'content-type': 'application/json'
			}
		});

		toast = await response.json();
		await resetStepper();
		if (toast.success) {
			goto('/shootEvents/' + toast.eventId);
		}
	}

	async function resetStepper() {
		await resetShootEvent();
		inputRoundName = 'Round' + ($thisEvent.eventRounds.length + 1);
		resetStations();
	}
</script>

<div class="flex font-sans flex-col max-w-[650px] mx-auto p-5">
	<Stepper on:complete={callAddShootEvent}>
		<Step>
			<svelte:fragment slot="header">
				<div class="flex">Add Event</div>
				<div class="flex justify-end">
					<button type="button" class="btn variant-filled-warning" on:click={resetStepper}
						>Reset</button
					>
				</div>
			</svelte:fragment>
			<label class="label">
				<span>Event Name</span>
				<input class="input" type="text" name="eventName" bind:value={$thisEvent.eventName} />
			</label>
			<p class="my-2">Click Next to create a new Event with default settings.</p>
		</Step>
		
		<Step>
			<svelte:fragment slot="header">Add Teams</svelte:fragment>
			Add Team Name and Shooter information and click + Add Team. When finished click next to view a
			summary.
			<!-- todo <AddTeam /> -->
			<div class="flex-1 card p-5 m-5">
				<label class="label">
					<span>
						Team Name
						<button type="button" class="flex-1 mx-1 btn variant-ghost-primary" on:click={getNewTeamName}
						>Random Team Name</button>
					</span>
					<input class="input" type="text" name="teamName" bind:value={inputTeamName} />
					{#if shooterIndex < 3}
						<span>Shooter {shooterIndex}</span>
					{/if}
					<div class="flex m-1 p-1 justify-end">
						{#if shooterIndex < 3}
							<div>
								<input class="input" type="text" name="shooter1Name" bind:value={inputS1} />
							</div>
							<div>
								<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={() => addShooter(inputS1)}
									>+ Shooter</button>
							</div>
						{/if}
						<div>
							<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={resetShooter}
								>Reset</button>
						</div>
					</div>
				</label>
				<div class="flex m-1 p-1 justify-end">
					
					<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={addTeam}
						>+ Team</button
					>
					<button type="button" class="flex mx-1 btn variant-ghost-tertiary" on:click={undoTeam}
						>🔙 Undo</button
					>
				</div>
				<div class="flex flex-wrap justify-around">
					{#each $thisEvent.eventTeams as t}
						<div class="flex-1 card m-3 p-3">
							<div class="flex flex-wrap my-0 mx-2 justify-center">
								<span class="h4">{t.teamName}</span>
							</div>
							<div class="flex flex-wrap my-0 mx-2 justify-center">
								<span class="h5">{t.teamShooter1} | {t.teamShooter2}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</Step>
		
		<Step>
			<svelte:fragment slot="header">Event Format</svelte:fragment>
			Specify number of stations and clays and click + Add Round. When finished click next to configure
			Teams
			<div class="flex-1 card p-5 m-5">
				<span class="h3">Add Station</span>
				<label class="label">
					<span>Round Name</span>
					<input class="input" type="text" name="roundName" bind:value={inputRoundName} />
				</label>
				
				<div class="flex m-1 p-1 justify-end">
					<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={() => addStation(1)}
						>+ Single</button>
					<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={() => addStation(2)}
						>+ Pair</button>
					<button type="button" class="flex mx-1 btn variant-ghost-error" on:click={resetStations}
						>Reset</button>
				</div>
				<div class="flex m-1 p-1 justify-end">
					<button type="button" class="flex mx-1 btn variant-ghost-success" on:click={addRound}
						>+ Round</button>
					<button type="button" class="flex mx-1 btn variant-ghost-warning" on:click={undoRound}
						>🔙 Undo</button>
				</div>
				<div class="flex m-1 p-1" />

				{#if inputStations.length > 0}
					<div class="h4">Stations</div>
					<div class="flex flex-wrap justify-around card">
						{#each inputStations as s}
						<div class="flex-1 m-3 p-3">
							<div class="flex flex-wrap my-0 mx-2 justify-center">
								<img class="w-5" src={clay} alt="clay" />x{s.stationClays}
							</div>
							<div class="flex flex-wrap m-2 p-2 justify-center">
								<img class="w-3" src={shell} alt="shell" />x{s.stationAmmo}
							</div>
						</div>
						{/each}
					</div>
				{/if}

				<div class="flex flex-wrap justify-around">
					{#each $thisEvent.eventRounds as r}
						<div class="flex-1 card m-3 p-3">
							<span class="h4">{r.roundName}</span>
							<div class="flex flex-wrap my-0 mx-2 justify-center">
								<img class="w-5" src={clay} alt="clay" />x{r.roundClays.length}
							</div>
							<div class="flex flex-wrap m-2 p-2 justify-center">
								<img class="w-3" src={shell} alt="shell" />x{r.roundAmmo.length}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</Step>
		
		<Step>
			<svelte:fragment slot="header">Summary</svelte:fragment>
			Review event summary. Click back to make any changes, otherwise click Complete to begin event!
			<!-- todo <ShowSummary /> -->
			<!-- event summary -->
			<p class="h3">{$thisEvent.eventName}</p>
			<!-- event format -->
			<p class="h3">Event Format</p>
			<Table source={roundTable} />
			<!-- event format -->
			<p class="h3">Teams</p>
			<Table source={teamTable} />
		</Step>
	</Stepper>
</div>
