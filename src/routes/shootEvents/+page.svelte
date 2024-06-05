<script lang="ts">
	import { Step, Stepper, tableMapperValues, Table } from '@skeletonlabs/skeleton';
	import { thisEvent, resetShootEvent } from '$lib/client/localStoragedb';
	import shell from '$lib/images/shell.svg';
	import clay from '$lib/images/capshield.svg';
	import { goto } from '$app/navigation';

	let inputStations = 3;
	let inputClays = 2;
	let inputAmmo = 4;
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

	function addRound() {
		if (inputRoundName.trim().length === 0)
			inputRoundName = 'Round' + ($thisEvent.eventFormat.length + 1);
		$thisEvent.eventFormat = [
			...$thisEvent.eventFormat,
			{
				roundId: $thisEvent.eventFormat.length + 1,
				roundName: inputRoundName,
				roundAmmo: '-'.repeat(inputStations * inputAmmo),
				roundClays: '-'.repeat(inputStations * inputClays),
				roundAmmoNum: String(inputStations * inputAmmo),
				roundClaysNum: String(inputStations * inputClays),
				roundStations: inputStations,
				roundState: 'NEW'
			}
		];
		$thisEvent.eventTeamScores.forEach((team) => {
			team.teamScores = $thisEvent.eventFormat;
		});
		inputRoundName = 'Round' + ($thisEvent.eventFormat.length + 1);
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

<pre>
    <!-- {JSON.stringify(dbShootEvents, null, 4)} -->
</pre>
<div class="flex flex-col max-w-[650px] mx-auto p-5">
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
			<svelte:fragment slot="header">Add Round Format</svelte:fragment>
			Specify number of stations and clays and click + Add Round. When finished click next to configure
			Teams
			<!-- todo <AddRound /> -->
			<div class="flex-1 card p-5 m-5">
				<span class="h3">Event Format</span>
				<label class="label">
					<span>Round Name</span>
					<input class="input" type="text" name="roundName" bind:value={inputRoundName} />
				</label>
				<div class="flex m-2 p-2">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="flex-1 justify-around">
						<span class="chip"># of Stations</span>
					</label>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="flex-1 justify-around">
						<span class="chip">Clays per Station</span>
					</label>
					<!-- svelte-ignore a11y-label-has-associated-control -->
				</div>
				<div class="flex m-2 p-2">
					<div class="flex-1 px-3 justify-around">
						<input
							class="input"
							type="number"
							name="roundStations"
							bind:value={inputStations}
							min="1"
							max="6"
						/>
					</div>
					<div class="flex-1 px-3 justify-around">
						<input
							class="input"
							type="number"
							name="roundClays"
							bind:value={inputClays}
							min="2"
							max="6"
						/>
					</div>
				</div>
				<div class="flex m-2 p-2">
					<input
						class="input flex-1 px-5 mx-5"
						type="range"
						bind:value={inputStations}
						min="1"
						max="6"
					/>
					<input
						class="input flex-1 px-5 mx-5"
						type="range"
						bind:value={inputClays}
						min="2"
						max="6"
					/>
				</div>
				<div class="flex m-1 p-1 justify-end">
					<button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={addRound}
						>+ Round</button
					>
					<button type="button" class="flex mx-1 btn variant-ghost-tertiary" on:click={undoRound}
						>🔙 Undo</button
					>
				</div>
				<div class="flex m-1 p-1" />

				<div class="flex flex-wrap justify-around">
					{#each $thisEvent.eventFormat as r}
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
			<svelte:fragment slot="header">Add Teams</svelte:fragment>
			Add Team Name and Shooter information and click + Add Team. When finished click next to view a
			summary.
			<!-- todo <AddTeam /> -->
			<div class="flex-1 card p-5 m-5">
				<label class="label">
					<span>Team Name</span>
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
			<!-- todo <AddTeam /> -->
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
