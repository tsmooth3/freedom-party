<script lang="ts">
	import shell from '$lib/images/shell.svg';
	import shellshot from '$lib/images/shellshot.svg';
	import clay from '$lib/images/capshield.svg';
	import clayhit from '$lib/images/capshield_broken.svg';
	import claymiss from '$lib/images/capshield_miss.svg';
	export let roundName: string;
	export let clays: string;
	export let ammos: string;
	export let roundState: string;
</script>

{#if roundState === 'ACTIVE'}
	<h1 class=" my-0 mx-1 bg-secondary-backdrop-token">
		{roundName} - ACTIVE
	</h1>
	<div class="flex my-0 mx-1 bg-secondary-backdrop-token">
		{#each clays.split('') as c}
			{#if c === '-'}
				<img class="w-6 md:w-8 lg:w-10" src={clay} alt="clay" />
			{:else if c === 'x'}
				<img class="w-6 md:w-8 lg:w-10" src={clayhit} alt="clayhit" />
			{:else if c === '|'}
				<span class="divider-vertical border-0" />
			{:else}
				<img class="w-6 md:w-8 lg:w-10" src={claymiss} alt="claymiss" />
			{/if}
		{/each}
	</div>
	<div class="flex my-0 mx-1 bg-secondary-backdrop-token">
		{#each ammos.split('') as a}
			{#if a === '-'}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shell} alt="shell" />
			{:else if a === '|'}
				<span class="divider-vertical border-0" />
			{:else}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shellshot} alt="shellshot" />
			{/if}
		{/each}
	</div>
{:else}
	<h1 class="my-0 mx-1">{roundName}</h1>
	<div class="flex my-0 mx-1">
		{#each clays.split('') as c}
			{#if c === '-'}
				<img class="w-6 md:w-8 lg:w-10" src={clay} alt="clay" />
			{:else if c === 'x'}
				<img class="w-6 md:w-8 lg:w-10" src={clayhit} alt="clayhit" />
			{:else if c === '|'}
				<span class="divider-vertical border-0" />
			{:else}
				<img class="w-6 md:w-8 lg:w-10" src={claymiss} alt="claymiss" />
			{/if}
		{/each}
	</div>
	<div class="flex my-0 mx-1">
		{#each ammos.split('') as a}
			{#if a === '-'}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shell} alt="shell" />
			{:else if a === '|'}
				<span class="divider-vertical border-0" />
			{:else}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shellshot} alt="shellshot" />
			{/if}
		{/each}
	</div>
{/if}
