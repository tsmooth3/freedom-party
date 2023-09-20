<script lang="ts">
	import type { prismaTeamScore } from '$lib/shared/utils';
	import RoundHorizontal from './RoundHorizontal.svelte';
	import RoundHorizontalActive from './RoundHorizontalActive.svelte';
	export let teamData: prismaTeamScore;
	export let totalClays: number;

	$: clayPercentage = 0;
	$: ammoPercentage = 0;

	$: if (teamData.teamTotal !== null && teamData.teamShotsFired !== null) {
		clayPercentage = Math.round((teamData.teamTotal / totalClays) * 100);
		ammoPercentage = Math.round((teamData.teamTotal / teamData.teamShotsFired) * 100);
	}
</script>

<div class="flex m-3 gap-3">
	{#if teamData.teamState === 'ACTIVE'}
		<div class="flex-1 card card-hover p-4 text-center place-content-center variant-ghost-success">
			<h2>{teamData.teamName}</h2>
			<p>{teamData.teamShooter1} | {teamData.teamShooter2}</p>
		</div>
		<span class="divider-vertical" />
		<div class="flex-1 card card-hover p-4 text-center my-auto variant-ghost-success">
			<h2>Score</h2>
			<p>
				{#if teamData.teamTotal}
					Clays: {teamData.teamTotal}/{totalClays} : {clayPercentage}% | Ammo: {teamData.teamTotal}/{teamData.teamShotsFired}
					: {ammoPercentage}%
				{:else}
					Clays: 0% | Ammo: 0%
				{/if}
			</p>
		</div>
	{:else}
		<div class="flex-1 card card-hover p-4 text-center place-content-center variant-ghost">
			<h2>{teamData.teamName}</h2>
			<p>{teamData.teamShooter1} | {teamData.teamShooter2}</p>
		</div>
		<span class="divider-vertical" />
		<div class="flex-1 card card-hover p-4 text-center my-auto variant-ghost">
			<h2>Score</h2>
			<p>
				{#if teamData.teamTotal}
					Clays: {teamData.teamTotal}/{totalClays} : {clayPercentage}% | Ammo: {teamData.teamTotal}/{teamData.teamShotsFired}
					: {ammoPercentage}%
				{:else}
					Clays: 0% | Ammo: 0%
				{/if}
			</p>
		</div>
	{/if}
</div>

<div class="flex m-3 gap-3">
	{#each teamData.teamScores as round}
		<div class=" flex-auto">
			{#if round.roundState === 'ACTIVE'}
				<RoundHorizontalActive
					roundName={round.roundName}
					clays={round.roundClays}
					ammos={round.roundAmmo}
				/>
			{:else}
				<RoundHorizontal
					roundName={round.roundName}
					clays={round.roundClays}
					ammos={round.roundAmmo}
				/>
			{/if}
		</div>
	{/each}
</div>
<hr class="!border-t-4 mx-10 my-3" />
