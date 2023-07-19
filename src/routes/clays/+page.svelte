<script lang="ts">
	import TeamData from './TeamData.svelte';
    import { teamData } from '$lib/data/teamData';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import cap from '$lib/images/capshield.svg'
    import doglaugh from '$lib/images/doglaugh.gif'
	let screenSize: number;
</script>
<svelte:window bind:innerWidth={screenSize} />

<div class="flex my-auto min-w-[390px] justify-end">
    <a href="/shootEvents"><button type="button" class="btn variant-filled">Add Event</button></a>
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
<div class="flex my-auto min-w-[390px]">
    <img class="flex-1 mx-auto min-w-[390px] max-w-[690px]" src={doglaugh} alt="duck hunt dog"/>
</div>