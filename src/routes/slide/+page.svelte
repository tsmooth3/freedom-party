<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import DataTable from '$lib/components/DataTable.svelte';
	import type { prismaSlide } from '$lib/shared/utils';
    let inputName: string;
    let inputSpeed: number;
    export let data: PageData;
    let slides: prismaSlide[] = data.dbSlides;
    $: slides = data.dbSlides;
</script>

    <form method="POST" action="?/submitSpeed" use:enhance>
        <div class="flex my-auto p-5 min-w-[390px] max-w-6xl mx-auto">
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
            <div class="m-3 p-3">
                <button type="submit" formaction="?/submitSpeed" class="btn w-full variant-outline-primary variant-ghost-primary">Submit</button>
            </div>
        </div>
    </form>
    {#await data}
        <p>loading...</p>
    {:then items} 
    <pre>
        {#each items.dbSlides as slide}
            <pre>{slide}</pre>
        {/each}
    </pre>
    <div class="flex">
        <div class="flex-col my-auto p-5 min-w-[390px] max-w-6xl mx-auto">
            <div>TimeStamp</div>
            {#each slides as row}
            <div>{row.timeStamp}</div>
            {/each}
        </div>
        <div class="flex-col my-auto p-5 min-w-[390px] max-w-6xl mx-auto">
            <div>Slider</div>
            {#each slides as row}
            <div>{row.sliderName}</div>
            {/each}
        </div>
        <div class="flex-col my-auto p-5 min-w-[390px] max-w-6xl mx-auto">
            <div>Speed (FPS)</div>
            {#each slides as row}
            <div>{row.sliderFPS}</div>
            {/each}
        </div>
        <div class="flex-col my-auto p-5 min-w-[390px] max-w-6xl mx-auto">
            <div>Speed (MPH)</div>
            {#each slides as row}
            <div>{row.sliderMPH}</div>
            {/each}
        </div>
    </div>
    {/await}
       <!-- <DataTable myData={data.dbSlides} ></DataTable> -->
    

