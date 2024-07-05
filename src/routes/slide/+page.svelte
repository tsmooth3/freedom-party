<script lang="ts">
    import { Table, tableMapperValues } from '@skeletonlabs/skeleton';
    import type { TableSource } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
	import type { prismaSlide } from '$lib/shared/utils';
    import { enhance } from '$app/forms';

    let inputName: string;
    let inputSpeed: number;
    export let data: PageData;
    let sourceData: prismaSlide[];

    // let sourceData: prismaSlide[] = []
    // data.dbSlides[0].id
    // data.dbSlides[0].timeStamp
    // data.dbSlides[0].sliderName
    // data.dbSlides[0].sliderFPS
    // data.dbSlides[0].sliderMPH

    // $: if(data.dbSlides){   
    //     data.dbSlides.forEach(element => {
    //         sourceData.push(element)
    //     });
    // }

    // const sourceData = [
    //     { position: 1, name: 'Justin', topSpeed: 23, trys: 4 },
    //     { position: 2, name: 'Alex', topSpeed: 22, trys: 4 },
    //     { position: 3, name: 'Burt', topSpeed: 22, trys: 4 },
    //     { position: 4, name: 'Derek', topSpeed: 22, trys: 2 },
    // ];

    let tableSimple: TableSource

    $: tableSimple = {
        // A list of heading labels.
        head: ['TimeStamp', 'Slider', 'Speed (FPS)', 'Speed (MPH)'],
        // The data visibly shown in your table body UI.
        body: tableMapperValues(data.dbSlides, ['timeStamp', 'sliderName', 'sliderFPS', 'sliderMPH']),
        // Optional: The data returned when interactive is enabled and a row is clicked.
        // meta: tableMapperValues(sourceData, ['position', 'name', 'symbol', 'weight']),
        // Optional: A list of footer labels.
        // foot: ['Total', '', '<code class="code">5</code>']
    };

</script>

<!-- {#await data}
    
{:then data } 
    
{/await} -->
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
