<script lang="ts">
	import shell from '$lib/images/shell.svg';
	import shellshot from '$lib/images/shellshot.svg';
	import shellhit from '$lib/images/shell_shot.svg';
	import clay from '$lib/images/capshield.svg';
	import clayhit from '$lib/images/capshield_broken.svg';
	import claymiss from '$lib/images/capshield_miss.svg';
	export let roundName: String;
	export let presentationName: String;
	export let allStations: String;	
</script>
<div class="my-0 mx-1">{roundName} : {presentationName}</div>
<div class="flex">
	{#each allStations.split('|') as s}
		<div class='flex-auto m-2 p-2 variant-ghost-surface rounded-lg'>
			{s.split(',')[0]}
			<div class="flex my-0 mx-1">
				{#each s.split(',')[1].split('') as c}
					{#if c === '-'}
						<img class="w-6 md:w-8 lg:w-10" src={clay} alt="clay" />
					{:else if c === 'x'}
						<img class="w-6 md:w-8 lg:w-10" src={clayhit} alt="clayhit" />
					{:else}
						<img class="w-6 md:w-8 lg:w-10 opacity-50" src={claymiss} alt="claymiss" />
					{/if}
				{/each}
			</div>
			<div class="flex my-0 mx-1">
				{#each s.split(',')[2].split('') as a}
				{#if a === '-'}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shell} alt="shell" />
				{:else if a === 'x'}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shellhit} alt="shellhit" />
				{:else}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shellshot} alt="shellshot" />
				{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
<!-- <div class='card variant-ghost-success'>

	<h1 class="my-0 mx-1">Current Presentation</h1>
	<h1 class="my-0 mx-1">{presentationName}</h1>
	<div class="flex my-0 mx-1">
		{#each stationClays.split('') as c}
			{#if c === '-'}
				<img class="w-6 md:w-8 lg:w-10" src={clay} alt="clay" />
			{:else if c === 'x'}
				<img class="w-6 md:w-8 lg:w-10" src={clayhit} alt="clayhit" />
			{:else}
				<img class="w-6 md:w-8 lg:w-10 opacity-50" src={claymiss} alt="claymiss" />
			{/if}
		{/each}
	</div>
	<div class="flex my-0 mx-1">
		{#each stationAmmos.split('') as a}
			{#if a === '-'}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shell} alt="shell" />
			{:else if a === 'x'}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shellhit} alt="shellhit" />
			{:else}
				<img class="m-1 h-6 md:h-8 lg:h-10" src={shellshot} alt="shellshot" />
			{/if}
		{/each}
	</div>
</div> -->