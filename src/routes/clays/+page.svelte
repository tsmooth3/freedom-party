<script lang="ts">
	import TeamData from '$lib/components/TeamData.svelte';
	import { mydbShootEvents } from '$lib/client/localStoragedb';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import cap from '$lib/images/capshield.svg';
	import doglaugh from '$lib/images/doglaugh.gif';
	import type { PageData } from './$types';
	let screenSize: number;
	export let data: PageData;
	$mydbShootEvents = data.dbShootEvents;
</script>

<svelte:window bind:innerWidth={screenSize} />
{#await data}
	<p class="h2">Loading ...</p>
{:then}
	<div class="flex my-auto min-w-[390px] justify-end">
		<a href="/shootEvents"><button type="button" class="btn variant-filled">Add Event</button></a>
	</div>
	<div class="flex my-auto min-w-[390px]">
		<Accordion>
			{#each $mydbShootEvents as se}
				<AccordionItem>
					<svelte:fragment slot="lead"
						><a href="/shootEvents/{se.id}"><img class="h-8" src={cap} alt="cap" /></a
						></svelte:fragment
					>
					<svelte:fragment slot="summary"
						>{se.eventName} : {se.id} : {se.eventState}</svelte:fragment
					>
					<svelte:fragment slot="content">
						{#each se.eventTeamScores as ets}
							{#if screenSize > 1368}
								<a href="/shootEvents/{se.id}">
									<TeamData teamData={ets} orientation="horizontal" />
								</a>
							{:else}
								<a href="/shootEvents/{se.id}">
									<TeamData teamData={ets} orientation="vertical" />
								</a>
							{/if}
						{/each}
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	</div>

	<div class="flex my-auto min-w-[390px]">
		<img class="flex-1 mx-auto min-w-[390px] max-w-[690px]" src={doglaugh} alt="duck hunt dog" />
	</div>
{/await}
