<script lang="ts">
	import LegendCompact from '$lib/components/LegendCompact.svelte';
	import TeamData from '$lib/components/TeamData.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import doglaugh from '$lib/images/doglaugh.gif';
	import clay from '$lib/images/capshield.svg';
	import type { PageData } from './$types';
	let screenSize: number;
	export let data: PageData;
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
			{#each data.dbShootEvents as se}
				<AccordionItem>
					<svelte:fragment slot="lead"
						><a href="/watchEvent/{se.id}"><img class="h-8" src={clay} alt="capshield" /></a
						></svelte:fragment
					>
					<svelte:fragment slot="summary">
						{new Date(se.createdAt).toDateString()} :
						{se.eventName} :
						{se.eventState}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<!-- <form method="POST" action="?/deleteEvent" use:enhance>
							<input type="hidden" name="eventId" value={se.id} />
							<button class="btn variant-outline-success variant-ghost-warning">Delete Event</button
							>
						</form> -->
						{#each se.eventTeamScores as ets}
							{#if screenSize > 1368}
								<a href="/shootEvents/{se.id}">
									<TeamData teamData={ets} orientation="horizontal"/>
								</a>
							{:else}
								<a href="/shootEvents/{se.id}">
									<TeamData teamData={ets} orientation="vertical"/>
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
	<LegendCompact/>
{/await}
