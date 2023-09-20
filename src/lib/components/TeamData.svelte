<script lang="ts">
	import type { prismaTeamScore } from '$lib/shared/utils';
	import TeamDataHorizontal from './TeamDataHorizontal.svelte';
	import TeamDataVertical from './TeamDataVertical.svelte';
	export let teamData: prismaTeamScore;
	export let totalClays: number;
	export let orientation: string;
</script>

{#if orientation === 'horizontal'}
	<TeamDataHorizontal {teamData} {totalClays} />
{/if}

{#if orientation === 'vertical'}
	<TeamDataVertical {teamData} {totalClays} />
{/if}
