<script lang="ts">
	import type { prismaTeam } from '$lib/shared/utils';
	import RoundVertical from './RoundVertical.svelte';
	export let teamData: prismaTeam;
	export let totalClays: number;

	$: clayPercentage = 0;
	$: ammoPercentage = 0;

	$: if (teamData.teamTotal !== null && teamData.teamShotsFired !== null) {
		clayPercentage = Math.round((teamData.teamTotal / totalClays) * 100);
		ammoPercentage = Math.round((teamData.teamTotal / teamData.teamShotsFired) * 100);
	}
</script>

<div class="flex flex-col mx-auto gap-2 max-w-2xl">
	{#if teamData.teamState === 'ACTIVE'}
		<div class="flex-1 card card-hover p-2 text-justify variant-ghost-success">
			<h3 class="h3">{teamData.teamName}</h3>
			<h5 class="h5">{teamData.teamShooter1} | {teamData.teamShooter2}</h5>
			<h5 class="h5">
				{#if teamData.teamTotal}
					Clays: {teamData.teamTotal}/{totalClays} : {clayPercentage}%
				{:else}
					Clays: 0%
				{/if}
			</h5>
			<h5 class="h5">
				{#if teamData.teamShotsFired}
					Ammo: {teamData.teamTotal}/{teamData.teamShotsFired} : {ammoPercentage}%
				{:else}
					Ammo: 0%
				{/if}
			</h5>
		</div>
	{:else}
		<div class="flex-1 card card-hover p-2 text-justify variant-ringed-secondary">
			<h3 class="h3">{teamData.teamName}</h3>
			<h5 class="h5">{teamData.teamShooter1} | {teamData.teamShooter2}</h5>
			<h5 class="h5">
				{#if teamData.teamTotal}
					Clays: {teamData.teamTotal}/{totalClays} : {clayPercentage}%
				{:else}
					Clays: 0%
				{/if}
			</h5>
			<h5 class="h5">
				{#if teamData.teamShotsFired}
					Ammo: {teamData.teamTotal}/{teamData.teamShotsFired} : {ammoPercentage}%
				{:else}
					Ammo: 0%
				{/if}
			</h5>
		</div>
	{/if}
	<div class="flex-1 card my-auto p-2 variant-ringed-error variant-glass-error">
		{#each teamData.teamScores as round}
			<RoundVertical
				roundName={round.roundName}
				clays={round.roundClays}
				ammos={round.roundAmmo}
				roundState={round.roundState}
			/>
		{/each}
	</div>
</div>
<hr class="!border-t-4 mx-10 my-3" />
