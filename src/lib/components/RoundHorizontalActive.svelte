<script lang="ts">
	import shell from '$lib/images/shell.svg';
	import shellshot from '$lib/images/shellshot.svg';
	import clay from '$lib/images/capshield.svg';
	import clayhit from '$lib/images/capshield_broken.svg';
	import claymiss from '$lib/images/capshield_miss.svg';
	export let roundName: string;
	export let clays: string;
	export let ammos: string;
</script>

<div class="flex-1 card mx-auto p-3 variant-ghost-success">
	<h1>{roundName}</h1>
	<div class="flex justify-center my-3">
		{#each clays.split('') as c}
			{#if c === '-'}
				<img class="w-6" src={clay} alt="clay" />
			{:else if c === 'x'}
				<img class="w-6" src={clayhit} alt="clayhit" />
			{:else if c === '|'}
				<span class="divider-vertical border-0" />
			{:else}
				<img class="w-6" src={claymiss} alt="claymiss" />
			{/if}
		{/each}
	</div>
	<div class="flex flex-wrap">
		{#each ammos.split('') as a}
			{#if a === '-'}
				<img class="h-6" src={shell} alt="shell" />
			{:else if a === '|'}
				<span class="divider-vertical border-0" />
			{:else}
				<img class="h-6" src={shellshot} alt="shellshot" />
			{/if}
		{/each}
	</div>
</div>
