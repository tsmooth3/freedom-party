<script lang="ts">
    import { Table, tableMapperValues } from '@skeletonlabs/skeleton';
    import type { TableSource } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';

    let inputName: string;
    let inputSpeed: number;
    export let data: PageData;


    let tableSimple: TableSource = {
        head: ['TimeStamp', 'Slider', 'Speed (FPS)', 'Speed (MPH)'],
        body: tableMapperValues([], []),
    }

    $: tableSimple = {
            head: ['TimeStamp', 'Slider', 'Speed (FPS)', 'Speed (MPH)'],
            body: tableMapperValues(data.dbSlides, ['timeStamp', 'sliderName', 'sliderFPS', 'sliderMPH']),
    };
</script>

{#await data.dbSlides}
    <p>loading ...</p>
{:then data}
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
        <Table source={tableSimple} interactive={true} regionHeadCell="text-right" regionCell="text-right"/>
    </div>
            
{:catch error}
    <p>something went wrong ...</p>
{/await}

