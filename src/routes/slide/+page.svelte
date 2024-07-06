<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { prismaSlide } from "$lib/shared/utils";
    import DataTable from '$lib/components/DataTable.svelte';
    let inputName: string;
    let inputSpeed: number;
    let interval: number;
    let slides: prismaSlide[] | null = null;

    async function fetchData(): Promise<void> {
      try {
        const response = await fetch('/api/slides');
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        slides = await response.json()
      } catch (error) {
        console.error(error);
      }
    }
  
    onMount(() => {
      fetchData();
      interval = window.setInterval(fetchData, 35000); // Poll every 5 seconds
    });
  
    onDestroy(() => {
      clearInterval(interval);
    });

</script>

<form method="POST" action="?/submitSpeed">
    <div class="flex m-auto p-5 min-w-[390px] max-w-[690px]">
        <div class="p-3">
            <div class="flex-col">
                <div>
                    <label for="slider">Slider: </label>
                </div>
                <div>
                    <input class="input" type="text" name="slider" bind:value={inputName} />
                </div>
            </div>
        </div>
        <div class="p-3">
            <div class="flex-col">
                <div>
                    <label for="speed">Speed: </label>
                </div>
                <div>
                    <input class="input" type="number" name="speed" bind:value={inputSpeed} />
                </div>
            </div>
        </div>
        <div class="m-5 p-3">
            <button type="submit" formaction="?/submitSpeed" class="btn w-full variant-outline-primary variant-ghost-primary">Submit</button>
        </div>
    </div>
</form>

{#if slides}
    <div class="flex mx-auto min-w-[390px] max-w-[800px] justify-center">
            <DataTable myData={slides}></DataTable>
    </div>    
{/if}