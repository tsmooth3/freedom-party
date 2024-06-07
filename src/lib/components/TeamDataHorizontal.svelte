<script lang="ts">
	import type { prismaTeamScore } from '$lib/shared/utils';
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

<div class="flex m-3 gap-3 font-sans">
	{#if teamData.teamState === 'ACTIVE'}
		<div class="flex card card-hover mx-auto p-2 variant-outline-success">
			<div class="flex text-left">
				<div class="flex-col my-auto min-w-[190px]">
					<div>{teamData.teamName}</div>
					<div>{teamData.teamShooter1} | {teamData.teamShooter2}</div>
					{#if teamData.teamTotal}
						<div>Clays: {teamData.teamTotal}/{totalClays} : {clayPercentage}% </div>
						<div>Ammo: {teamData.teamTotal}/{teamData.teamShotsFired} : {ammoPercentage}% </div>
					{:else}
						<div>Clays: 0%</div>
						<div>Ammo: 0%</div>
					{/if}
				</div>
				<div class="flex m-3 gap-3">
					{#each teamData.teamScores as round}
						<div><RoundHorizontalActive {round}/></div>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div class="flex card card-hover p-2 mx-auto variant-outline-primary">
			<div class="flex text-left">
				<div class="flex-col my-auto min-w-[190px]">
					<div>{teamData.teamName}</div>
					<div>{teamData.teamShooter1} | {teamData.teamShooter2}</div>
					{#if teamData.teamTotal}
						<div>Clays: {teamData.teamTotal}/{totalClays} : {clayPercentage}% </div>
						<div>Ammo: {teamData.teamTotal}/{teamData.teamShotsFired} : {ammoPercentage}% </div>
					{:else}
						<div>Clays: 0%</div>
						<div>Ammo: 0%</div>
					{/if}
				</div>
				<div class="flex m-3 gap-3">
					{#each teamData.teamScores as round}
						<div><RoundHorizontalActive {round}/></div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
<!-- 
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
<hr class="!border-t-4 mx-10 my-3" /> -->
