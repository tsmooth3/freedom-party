<script lang="ts">
	import type { Data } from '@skeletonlabs/skeleton/dist/utilities/DataTable/types';
    import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
    
    export let data: PageData;
    type responseData = {
        success: boolean
        errors: Record<string, string>
    }

    let form: responseData

    async function addShootEvent(event: Event) {
        const formEl = event.target as HTMLFormElement
        const data = new FormData(formEl)

        console.dir(data);

        const response = await fetch(formEl.action, {
            method: 'POST',
            body: data
        })

        const responseData = await response.json();

        form = responseData
        formEl.reset()

        await invalidateAll();

    }

    async function removeShootEvent(event: Event) {
        const formEl = event.target as HTMLFormElement
        const data = new FormData(formEl)

        const response = await fetch(formEl.action, {
            method: 'DELETE',
            body: data
        });

        await invalidateAll();
    }

</script>

<pre>
    {JSON.stringify(data, null, 2)}
</pre>

<br/>
<br/>
<div class="flex m-10 justify-center">
    <form on:submit|preventDefault={addShootEvent} method="POST">
        <button class="btn variant-filled-primary" type="submit">Add Event</button>
    </form>
</div>

<div>
    {#each data.shootEvents as shootEvent}
        <div class="flex card mx-10 max-w-[650px] justify-evenly">
            <div class="flex-1 mx-5 my-auto text-center">
                {shootEvent.eventDate.toString()}
            </div>
            <div class="flex-1 mx-10 text-end">

                <form on:submit|preventDefault={removeShootEvent} method="POST">
                    <input type="hidden" name="id" value={shootEvent.eventId}/>
                    <button class=" btn-xl variant-outline-primary" type="submit">X</button>
                </form>
            </div>
        </div>
    {/each}
</div> 