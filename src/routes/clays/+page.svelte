<script>
	import TeamData from './TeamData.svelte';
    import { teamData } from '$lib/data/teamData.ts';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import cap from '$lib/images/capshield.svg'
	/**
	 * @type {number}
	 */
	let screenSize;
</script>
<svelte:window bind:innerWidth={screenSize} />

<div class="flex my-auto min-w-[390px] justify-center">
    <a href="/clays/manageevent">Add Event</a>
</div>
<div class="flex my-auto min-w-[390px]">
    <Accordion>
        <AccordionItem open>
            <svelte:fragment slot="lead" ><img class="h-8" src={cap} alt="cap"></svelte:fragment>
            <svelte:fragment slot="summary" >July 1, 2023</svelte:fragment>
            <svelte:fragment slot="content">
                {#each teamData as td}
                {#if screenSize > 1368}
                <TeamData teamData={td} orientation='horizontal'></TeamData>
                {:else}
                <TeamData teamData={td} orientation='vertical'></TeamData>
                {/if}
                {/each}
            </svelte:fragment>
        </AccordionItem>
        <AccordionItem >
            <svelte:fragment slot="lead" ><img class="h-8" src={cap} alt="cap"></svelte:fragment>
            <svelte:fragment slot="summary">July 6, 2024</svelte:fragment>
            <svelte:fragment slot="content">
                {#each teamData as td}
                    {#if screenSize > 1368}
                        <TeamData teamData={td} orientation='horizontal'></TeamData>
                    {:else}
                        <TeamData teamData={td} orientation='vertical'></TeamData>
                    {/if}
                {/each}
            </svelte:fragment>
        </AccordionItem>
    </Accordion>
</div>