<script lang="ts">
	import Round from '$lib/components/Round.svelte';
	import type { prismaTeamScore } from '$lib/shared/utils';
	export let teamData: prismaTeamScore;
	export let orientation: string;
	export let brokenClays: number = 0;
	export let totalClays: number = 0;
	export let totalAmmo: number = 0;
	export let shotAmmo: number = 0;

	teamData.teamScores.forEach((r) => {
		r.roundAmmo.split('').forEach((a: string) => {
			if (a === 'x') shotAmmo += 1;
			totalAmmo += 1;
		});
		r.roundClays.split('').forEach((c: string) => {
			if (c === 'x') brokenClays += 1;
			totalClays += 1;
		});
	});

	$: clayPercentage = Math.round((brokenClays / totalClays) * 100);
	$: ammoPercentage = Math.round((brokenClays / shotAmmo) * 100);
</script>

{#if orientation === 'horizontal'}
	<div class="flex m-3 gap-3">
		{#if teamData.teamState === 'ACTIVE'}
			<div
				class="flex-1 card card-hover p-4 text-center place-content-center variant-ghost-success"
			>
				<h2>{teamData.teamName}</h2>
				<p>{teamData.teamShooter1} | {teamData.teamShooter2}</p>
			</div>
		{:else}
			<div class="flex-1 card card-hover p-4 text-center place-content-center variant-ghost">
				<h2>{teamData.teamName}</h2>
				<p>{teamData.teamShooter1} | {teamData.teamShooter2}</p>
			</div>
		{/if}
		<span class="divider-vertical" />
		<div class="flex-1 card card-hover p-4 text-center my-auto variant-ghost">
			<h2>Score</h2>
			<p>
				Clays: {brokenClays}/{totalClays} : {clayPercentage}% | Ammo: {brokenClays}/{shotAmmo}/{totalAmmo}
				: {ammoPercentage}%
			</p>
		</div>
	</div>

	<div class="flex m-3 gap-3">
		{#each teamData.teamScores as round}
			{#if round.roundName === 'Shenanigans'}
				<div class="flex gap-3">
					<Round
						roundName={round.roundName}
						clays={round.roundClays}
						ammos={round.roundAmmo}
						{orientation}
					/>
				</div>
			{:else}
				<Round
					roundName={round.roundName}
					clays={round.roundClays}
					ammos={round.roundAmmo}
					{orientation}
				/>
			{/if}
		{/each}
	</div>
	<hr class="!border-t-4 mx-10 my-3" />
{/if}

{#if orientation === 'vertical'}
	<div class="flex flex-col mx-auto gap-2 max-w-2xl">
		<div class="flex-1 card card-hover p-2 text-justify variant-ghost">
			<h3 class="h3">{teamData.teamName} - {teamData.teamState}</h3>
			<h5 class="h5">{teamData.teamShooter1} | {teamData.teamShooter2}</h5>
			<h5 class="h5">
				Clays: {brokenClays}/{totalClays} : {clayPercentage}%
			</h5>
			<h5 class="h5">
				Ammo: {brokenClays}/{shotAmmo}/{totalAmmo} : {ammoPercentage}%
			</h5>
		</div>
		<div class="flex-1 card card-hover my-auto p-2 variant-ghost-error">
			{#each teamData.teamScores as round}
				<Round
					roundName={round.roundName}
					clays={round.roundClays}
					ammos={round.roundAmmo}
					{orientation}
				/>
			{/each}
		</div>
	</div>
	<hr class="!border-t-4 mx-10 my-3" />
{/if}
