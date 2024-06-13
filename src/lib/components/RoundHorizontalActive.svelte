<script lang="ts">
	import shell from '$lib/images/shell.svg';
	import shellshot from '$lib/images/shellshot.svg';
	import shellhit from '$lib/images/shell_shot.svg';
	import clay from '$lib/images/capshield.svg';
	import clayhit from '$lib/images/capshield_hit.svg';
	import claymiss from '$lib/images/capshield_miss.svg';
	import type { prismaRound } from '$lib/shared/utils';
	export let round: prismaRound;
</script>

{#if round.roundState === 'COMPLETE'}
	<div class="flex-1 card mx-auto p-3 variant-glass-tertiary">
		<h1>{round.roundName}</h1>
		<div class="flex justify-center my-3">
			{#each round.roundClays.split('') as c}
				{#if c === '-'}
					<img class="w-6" src={clay} alt="clay" />
				{:else if c === 'x'}
					<img class="w-6" src={clayhit} alt="clayhit" />
				{:else}
					<img class="w-6" src={claymiss} alt="claymiss" />
				{/if}
			{/each}
		</div>
		<div class="flex flex-wrap">
			{#each round.roundAmmo.split('') as a}
				{#if a === '-'}
					<img class="h-6" src={shell} alt="shell" />
				{:else if a === 'x'}
					<img class="h-6" src={shellhit} alt="shellhit" />
				{:else}
					<img class="h-6" src={shellshot} alt="shellshot" />
				{/if}
			{/each}
		</div>
	</div>
{:else}
	<div class="flex-1 card mx-auto p-3 variant-outline-error">
		<h1>{round.roundName}</h1>
		<div class="flex justify-center my-3">
			{#each round.roundClays.split('') as c}
				{#if c === '-'}
					<img class="w-6" src={clay} alt="clay" />
				{:else if c === 'x'}
					<img class="w-6" src={clayhit} alt="clayhit" />
				{:else}
					<img class="w-6" src={claymiss} alt="claymiss" />
				{/if}
			{/each}
		</div>
		<div class="flex flex-wrap">
			{#each round.roundAmmo.split('') as a}
				{#if a === '-'}
					<img class="h-6" src={shell} alt="shell" />
				{:else if a === 'x'}
					<img class="h-6" src={shellhit} alt="shellhit" />
				{:else}
					<img class="h-6" src={shellshot} alt="shellshot" />
				{/if}
			{/each}
		</div>
	</div>

{/if}
