<script lang="ts">
	import type { prismaTeam } from '$lib/shared/utils';
	import TeamDataHorizontal from './TeamDataHorizontal.svelte';
	import TeamDataVertical from './TeamDataVertical.svelte';
	export let teamData: prismaTeam;
	let totalClays: number;
	$: totalClays = teamData.teamScores
		.filter((score) => score.roundState === 'COMPLETE')
		.reduce((count, score) => {
			if (score.roundClays) {
				const xCount = (score.roundClays || []).length;
				count += xCount;
			}
			return count;
		}, 0);
	export let orientation: string;
</script>

{#if orientation === 'horizontal'}
	<TeamDataHorizontal {teamData} {totalClays} />
{/if}

{#if orientation === 'vertical'}
	<TeamDataVertical {teamData} {totalClays} />
{/if}
