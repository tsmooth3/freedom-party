<script lang="ts">
	import TeamData from '$lib/components/TeamData.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import cap from '$lib/images/capshield.svg';
	import doglaugh from '$lib/images/doglaugh.gif';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
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
						><a href="/shootEvents/{se.id}"><img class="h-8" src={cap} alt="cap" /></a
						></svelte:fragment
					>
					<svelte:fragment slot="summary">
						{se.eventName}-{se.eventState}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<form method="POST" action="?/deleteEvent" use:enhance>
							<input type="hidden" name="eventId" value={se.id} />
							<button class="btn variant-outline-success variant-ghost-warning">Delete Event</button
							>
						</form>
						{#each se.eventTeamScores as ets}
							{#if screenSize > 1368}
								<a href="/shootEvents/{se.id}">
									<TeamData
										teamData={ets}
										totalClays={se.eventTeamScores[0].teamScores.reduce((count, score) => {
											return (count += (score.roundClays || []).length);
										}, 0)}
										orientation="horizontal"
									/>
								</a>
							{:else}
								<a href="/shootEvents/{se.id}">
									<TeamData
										teamData={ets}
										totalClays={se.eventTeamScores[0].teamScores.reduce((count, score) => {
											return (count += (score.roundClays || []).length);
										}, 0)}
										orientation="vertical"
									/>
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
