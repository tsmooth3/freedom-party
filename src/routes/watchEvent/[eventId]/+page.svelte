<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { prismaShootEvent, prismaEventRound } from "$lib/shared/utils";
    import ScoreBoard from '$lib/components/ScoreBoard.svelte';
    import doglaugh from '$lib/images/doglaugh.gif';
    import type { PageData } from './$types';
	export let data: PageData;
    
    let screenSize: number;  
    let interval: number;
    let dbShootEvents: prismaShootEvent[] | null = null;
    let dbEventRounds: prismaEventRound[] | null = null;
  
    async function fetchData(): Promise<void> {
      try {
        const response = await fetch('/api/shootEvents/byLeader/' + data.id);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        dbShootEvents = await response.json()
      } catch (error) {
        console.error(error);
      }
      try {
        const response2 = await fetch('/api/eventRounds/' + data.id);
        if (!response2.ok) {
          throw new Error(`Error fetching data: ${response2.statusText}`);
        }
        dbEventRounds = await response2.json()

      } catch (error) {
        console.error(error);
      }
    }
  
    onMount(() => {
      fetchData();
      interval = window.setInterval(fetchData, 5000); // Poll every 5 seconds
    });
  
    onDestroy(() => {
      clearInterval(interval);
    });
</script>
  
<svelte:window bind:innerWidth={screenSize} />
<div>
    {#if dbShootEvents && dbEventRounds}
    <ScoreBoard shootEvent={dbShootEvents[0]} eventRounds={dbEventRounds} screenSize={screenSize}/>
    <div class="flex my-auto min-w-[390px]">
      <img class="flex-1 mx-auto min-w-[390px] max-w-[690px]" src={doglaugh} alt="duck hunt dog" />
    </div>
  {:else}
        <div>loading...</div>
  {/if}
</div>
  
  