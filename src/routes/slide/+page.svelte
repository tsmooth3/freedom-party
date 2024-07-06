<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import DataTable from '$lib/components/DataTable.svelte';
    let inputName: string;
    let inputSpeed: number;
    export let data: PageData;
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
    <div class="flex my-auto p-5 min-w-[390px] max-w-6xl mx-auto">
       <DataTable myData={data.dbSlides} ></DataTable>
    </div>
    

