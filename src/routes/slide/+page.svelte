<script lang="ts">
    import { DataHandler } from '@vincjo/datatables'
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';

    let inputName: string;
    let inputSpeed: number;
    export let data: PageData;

    const handler = new DataHandler(data.dbSlides, { rowsPerPage: 50 })
    const rows = handler.getRows()

    $: handler.setRows(data.dbSlides)


</script>

{#await data}
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
        <table>
            <thead>
                <tr>
                    <th>TimeStamp</th>
                    <th>Slider</th>
                    <th>Speed (FPS)</th>
                    <th>Speed (MPH)</th>
                </tr>
            </thead>
            <tbody>
                {#each $rows as row}
                    <tr>
                        <td>{row.timeStamp}</td>
                        <td>{row.sliderName}</td>
                        <td>{row.sliderFPS}</td>
                        <td>{row.sliderMPH}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
            
{:catch error}
    <p>something went wrong ...</p>
{/await}

