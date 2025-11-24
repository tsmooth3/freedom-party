<script lang="ts">
	import { Step, Stepper, tableMapperValues, Table } from '@skeletonlabs/skeleton';
	import { thisEvent, resetShootEvent } from '$lib/client/localStoragedb';
	import type { RoundStation } from '$lib/shared/utils';
	import shell from '$lib/images/shell.svg';
	import clay from '$lib/images/capshield.svg';
	import { goto } from '$app/navigation';

	let inputRoundStation : RoundStation[] = [];
	let inputRoundName = 'Round' + ($thisEvent.eventFormat.length + 1);
	let inputTeamName = getRandomTeamName();
	let inputS1 = 'Player 1';
	let inputS2 = 'Player 2';

	$: roundTable = {
		head: ['Name', 'Stations', 'Clays', 'Ammo'],
		body: tableMapperValues($thisEvent.eventFormat, [
			'roundName',
			'roundStations',
			'roundClaysNum',
			'roundAmmoNum'
		])
	};

	$: teamTable = {
		head: ['Order', 'Team Name', 'Shooter 1', 'Shooter 2'],
		body: tableMapperValues($thisEvent.eventTeamScores, [
			'teamId',
			'teamName',
			'teamShooter1',
			'teamShooter2'
		])
	};

	$: totalEventClays = $thisEvent.eventFormat.reduce((total, round) => {
		return total + (round.roundClays?.length || 0);
	}, 0);

	$: totalEventAmmo = $thisEvent.eventFormat.reduce((total, round) => {
		return total + (round.roundAmmo?.length || 0);
	}, 0);

	// report pair = '--'
	// report triple = '---'
	// true triple = '---'
	// true report pair = '----'
	function addReportPair() {
		inputRoundStation = [
			...inputRoundStation,{
				stationId: inputRoundStation.length + 1,
				presentationName: 'Report Pair',
				stationAmmo: '----',
				stationClays: '--',
				stationState: 'NEW'
			}
		];
	}
	function addReportTriple() {
		inputRoundStation = [
			...inputRoundStation,{
				stationId: inputRoundStation.length + 1,
				presentationName: 'Report Triple',
				stationAmmo: '----',
				stationClays: '---',
				stationState: 'NEW'
			}
		];
	}
	function addTrueTriple() {
		inputRoundStation = [
			...inputRoundStation,{
				stationId: inputRoundStation.length + 1,
				presentationName: 'True Triple',
				stationAmmo: '----',
				stationClays: '---',
				stationState: 'NEW'
			}
		];
	}
	function addTrueReportPair() {
		inputRoundStation = [
			...inputRoundStation,{
				stationId: inputRoundStation.length + 1,
				presentationName: 'True Report Pair',
				stationAmmo: '----',
				stationClays: '----',
				stationState: 'NEW'
			}
		];
	}

	function addRound() {
		if (inputRoundStation.length === 0) {
			alert('Please add at least one station to the round');
			return;
		}
		let stationClays = inputRoundStation.map((station) => station.stationClays).join('');
		let stationAmmo = inputRoundStation.map((station) => station.stationAmmo).join('');
		if (inputRoundName.trim().length === 0)
			inputRoundName = 'Round' + ($thisEvent.eventFormat.length + 1);
		$thisEvent.eventFormat = [
			...$thisEvent.eventFormat,
			{
				roundId: $thisEvent.eventFormat.length + 1,
				roundName: inputRoundName,
				roundAmmo: stationAmmo,
				roundClays: stationClays,
				roundAmmoNum: String(stationAmmo.length),
				roundClaysNum: String(stationClays.length),
				roundStations: inputRoundStation.length,
				roundStationFormat: inputRoundStation,
				roundState: 'NEW'
			}
		];
		$thisEvent.eventTeamScores.forEach((team) => {
			team.teamScores = $thisEvent.eventFormat;
		});
		inputRoundName = 'Round' + ($thisEvent.eventFormat.length + 1);
		inputRoundStation = [];
	}
	function undoRound() {
		$thisEvent.eventFormat = $thisEvent.eventFormat.filter(
			(round, roundIndex) => roundIndex !== $thisEvent.eventFormat.length - 1
		);
		$thisEvent.eventTeamScores.forEach((team) => {
			team.teamScores = $thisEvent.eventFormat;
		});
		inputRoundName = 'Round' + ($thisEvent.eventFormat.length + 1);
	}
	function addTeam() {
		$thisEvent.eventTeamScores = [
			...$thisEvent.eventTeamScores,
			{
				teamId: $thisEvent.eventTeamScores.length + 1,
				teamName: inputTeamName.trimEnd(),
				teamShooter1: inputS1,
				teamShooter2: inputS2,
				teamState: 'NEW',
				teamScores: $thisEvent.eventFormat
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
			"Constitution Crew",
			"Unity Warriors",
			"Freedom Flaggers",
			"Patriotic Pioneers",
			"Stars of Freedom",
			"National Heroes",
			"Liberty Lancers",
			"Eagle Squadron",
			"United We Stand",
			"Pride of the Nation",
			"Banner Bearers",
			"Patriot Pride",
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
		$thisEvent.eventTeamScores = $thisEvent.eventTeamScores.filter(
			(team, teamIndex) => teamIndex !== $thisEvent.eventTeamScores.length - 1
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
		inputRoundName = 'Round' + ($thisEvent.eventFormat.length + 1);
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
			<svelte:fragment slot="header">Add Round
				<div class="flex justify-end">
					<button type="button" class="btn variant-filled-warning" on:click={resetStepper}
						>Reset</button
					>
				</div>
			</svelte:fragment>
			Specify number of stations and clays and click + Add Round. When finished click next to configure
			Teams
			<div class="flex-1 card p-5 m-5">
				<div class="flex items-center justify-between mb-3">
					<span class="h3">Event Format</span>
					{#if $thisEvent.eventFormat.length > 0}
						<div class="flex items-center gap-4">
							<div class="flex items-center gap-1">
								<img class="w-5" src={clay} alt="clay" />
								<span class="h4">{totalEventClays}</span>
							</div>
							<div class="flex items-center gap-1">
								<img class="w-3" src={shell} alt="shell" />
								<span class="h4">{totalEventAmmo}</span>
							</div>
						</div>
					{/if}
				</div>
				<label class="label">
					<span>Round Name</span>
					<input class="input" type="text" name="roundName" bind:value={inputRoundName} />
				</label>

				
				<div class="flex m-1 p-1 justify-end">
					<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={addReportPair}
					>Report Pair</button
					>
					<button type="button" class="flex mx-1 btn variant-ghost-tertiary" on:click={addReportTriple}
					>Report Triple</button
					>
					<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={addTrueTriple}
						>True Triple</button
					>
				</div>
				<div class="flex m-1 p-1 justify-end">
					<button type="button" class="flex mx-1 btn variant-ghost-tertiary" on:click={addTrueReportPair}
						>True Report Pair</button
					>
				</div>
				<div class="flex m-1 p-1 justify-end">
					<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={addRound}
						>+ Round</button
					>
					<button type="button" class="flex mx-1 btn variant-ghost-tertiary" on:click={undoRound}
						>🔙 Undo</button
					>
				</div>
				<div class="flex m-1 p-1"></div>

				{#if inputRoundStation.length > 0}
					<div class="flex-1 card m-3 p-3 variant-ringed-primary">
						<span class="h4">Round Builder: {inputRoundName}</span>
						<div class="flex flex-wrap justify-around">
							{#each inputRoundStation as s}
								<div class="flex-1 card m-3 p-3">
									<span class="h5">{s.presentationName}</span>
									<div class="flex flex-wrap my-0 mx-2 justify-center">
										<img class="w-5" src={clay} alt="clay" />x{s.stationClays.length}
									</div>
									<div class="flex flex-wrap m-2 p-2 justify-center">
										<img class="w-3" src={shell} alt="shell" />x{s.stationAmmo.length}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="flex flex-wrap justify-around">
					{#each $thisEvent.eventFormat as r}
						<div class="flex-1 card m-3 p-3">
							<span class="h4">{r.roundName}</span>
							<div class="flex flex-wrap justify-around">
								{#each r.roundStationFormat as s}
									<div class="flex-1 card m-3 p-3">
										<span class="h5">{s.presentationName}</span>
										<div class="flex flex-wrap my-0 mx-2 justify-center">
											<img class="w-5" src={clay} alt="clay" />x{s.stationClays.length}
										</div>
										<div class="flex flex-wrap m-2 p-2 justify-center">
											<img class="w-3" src={shell} alt="shell" />x{s.stationAmmo.length}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
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
						>Random Team Name</button
					>

					</span>
					<input class="input" type="text" name="teamName" bind:value={inputTeamName} />
					<span>Shooter 1</span>
					<input class="input" type="text" name="shooter1Name" bind:value={inputS1} />
					<span>Shooter 2</span>
					<input class="input" type="text" name="shooter2Name" bind:value={inputS2} />
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
					{#each $thisEvent.eventTeamScores as t}
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
