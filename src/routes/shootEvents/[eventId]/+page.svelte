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
	let teamLen = data.dbShootEvents[0].eventTeamScores.length;
	let roundLen = data.dbShootEvents[0].eventTeamScores[0].teamScores.length;
	let teamState: EventState = 'IDLE';

	let shooting = data.dbShootEvents[0].eventTeamScores.findIndex((p) => p.teamState === 'ACTIVE');
	let onDeck = data.dbShootEvents[0].eventTeamScores.findIndex((p) => p.teamState === 'ONDECK');
	if (shooting < 0 && onDeck < 0) {
		shooting = 0;
		onDeck = 1;
	}
	if (shooting < 0 && onDeck >= 0) {
		shooting = onDeck;
		if (shooting + 1 === teamLen) {
			onDeck = 0;
		} else {
			onDeck = shooting + 1;
		}
	}

	$: onDeckTeamName = data.dbShootEvents[0].eventTeamScores[onDeck].teamName;
	let round = data.dbActiveShootEvents[0].eventTeamScores[0].teamScores.findLastIndex(
		(p) => p.roundState === 'COMPLETE'
	);
	if (round + 1 === roundLen) {
		teamState = 'COMPLETE';
	} else {
		round++;
	}

	$: scoringEnabled = !(
		data.dbShootEvents[0].eventTeamScores[shooting].teamScores[round].roundAmmo.includes('-') &&
		data.dbShootEvents[0].eventTeamScores[shooting].teamScores[round].roundClays.includes('-')
	);
</script>

<svelte:window bind:innerWidth={screenSize} />

{#await data}
	<p>Loading ...</p>
{:then data}
	<div class="flex my-auto p-4 min-w-[390px] justify-end">
		<form method="POST" action="?/completeRound" use:enhance>
			<input type="hidden" name="eventId" value={data.dbShootEvents[0].id} />
			<input type="hidden" name="teamState" value={teamState} />
			<input
				type="hidden"
				name="teamId"
				value={data.dbShootEvents[0].eventTeamScores[shooting].id}
			/>
			<input
				type="hidden"
				name="teamId2"
				value={data.dbShootEvents[0].eventTeamScores[onDeck].id}
			/>
			<input
				type="hidden"
				name="teamScoreId"
				value={data.dbShootEvents[0].eventTeamScores[shooting].teamScores[round].id}
			/>
			{#if data.dbShootEvents[0].eventState === 'NEW'}
				<button
					formaction="?/startEvent"
					type="submit"
					class="btn variant-outline-primary variant-ghost-primary">Start Event</button
				>
			{:else}
				<input
					type="hidden"
					name="roundAmmo"
					value={data.dbShootEvents[0].eventTeamScores[shooting].teamScores[round].roundAmmo}
				/>
				<input
					type="hidden"
					name="roundClays"
					value={data.dbShootEvents[0].eventTeamScores[shooting].teamScores[round].roundClays}
				/>
				{#if scoringEnabled}
					<button type="submit" class="btn variant-outline">Complete Round</button>
				{/if}
				<button formaction="?/undo" type="submit" class="btn variant-outline-tertiary">undo</button>
				{#if !scoringEnabled}
					<button
						disabled={scoringEnabled}
						formaction="?/shot"
						type="submit"
						class="btn variant-filled-warning">shot</button
					>
					<button
						disabled={scoringEnabled}
						formaction="?/kill"
						type="submit"
						class="btn variant-filled-success">kill</button
					>
					<button
						disabled={scoringEnabled}
						formaction="?/lost"
						type="submit"
						class="btn variant-filled-error">lost</button
					>
				{/if}
			{/if}
		</form>
	</div>
	<div class="flex my-auto min-w-[390px]">
		<Accordion>
			{#each data.dbActiveShootEvents as se}
				<AccordionItem open>
					<svelte:fragment slot="lead"><img class="h-8" src={cap} alt="cap" /></svelte:fragment>
					<svelte:fragment slot="summary">
						{#if se.eventState === 'NEW'}
							Press Start Event to get started
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
		</Accordion>
	</div>

	<div class="flex my-auto min-w-[390px]">
		<img class="flex-1 mx-auto min-w-[390px] max-w-[690px]" src={doglaugh} alt="duck hunt dog" />
	</div>
{:catch error}
	<p>{error.message}</p>
{/await}
