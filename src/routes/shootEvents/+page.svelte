<script lang="ts">
    import { Step, Toast, toastStore, type ToastSettings, Stepper } from '@skeletonlabs/skeleton';
    import type { ActionData, PageData, SubmitFunction } from './$types';
	import { enhance } from '$app/forms';
    import shell from '$lib/images/shell.svg'
	import clay from '$lib/images/capshield.svg'

    
    export let data: PageData;
    export let form: ActionData;
    let defaultStations = 3
    let defaultAmmo = 4
    let defaultClays = 2

    let loading = false
    
    const t: ToastSettings = {
        message: 'Success',
        hideDismiss: true,
        timeout: 1000,
        background: 'variant-ghost-success'
    };

    const resetForm: SubmitFunction = ({ form }) => {
		return async ({ update }) => {
			await update({reset: false});
		};
	}

    const addEvent: SubmitFunction = (input) => {
        loading = true

        return async ( { update }) => {
            loading = false
            toastStore.trigger(t);
            await update()
        }

    }

</script>

{#if form?.success}
    <Toast />
{/if}
<!-- <pre>
    {JSON.stringify(form,null,4)}
</pre> -->
<div class="flex m-5 justify-end">
    <form method="POST" action="?/addShootEvent" use:enhance={addEvent}>
        <button class="btn variant-filled-primary" type="submit">New Event</button>
    </form>
</div>
{#each data.shootEvents as se}
    <div class="container flex-auto m-5 p-5 justify-around">
        <div class="flex-1 card p-5">
            <span class="flex-1 pb-4 h3">
                {se.eventName}
            </span>
            <div class="flex justify-end">
                <form method="POST" action="?/removeShootEvent" use:enhance>
                    <input type="hidden" name="id" value={se.eventId}/>
                    <button class="btn variant-ghost-error" type="submit">Remove Event</button>
                    <button class="btn variant-ghost-error" type="submit" formaction="?/clearEventRounds">Clear Event Format</button>
                </form>
            </div>
            
            <div class="flex-1 card p-5 m-5">
                <form method="POST" action="?/addRoundToShootEvent" use:enhance={resetForm}>
                    <span class="h3">Event Format</span>
                    <input class="variant-form-material" type="hidden" name="id" value={se.eventId}/>
                    <label class="label">
                        <span>Round Name</span>
                        <input class="input" type="text" name="roundName" value="Round{se.eventFormat.length + 1}" />
                    </label>
                    <div class="flex m-2 p-2">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="flex-1 justify-around">
                            <span class="chip"># of Stations</span>
                        </label>
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="flex-1 justify-around">
                            <span class="chip">Clays per Station</span>
                        </label>
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <label class="flex-1 justify-around">
                            <span class="chip">Ammo per Station</span>
                        </label>
                    </div>
                    <div class="flex m-2 p-2">
                        <label class="flex-1 px-3 justify-around">
                            <input class="input" type="number" name="roundStations" bind:value={defaultStations} min=1 max=6/>
                            {#if form?.missingStations}
                                <p class=" variant-soft-error">required</p>
                            {/if}
                        </label>
                        <label class="flex-1 px-3 justify-around">
                            <input class="input" type="number" name="roundClays" bind:value="{defaultClays}" min=2 max=6/>
                            {#if form?.missingClays}
                                <p class=" variant-soft-error">required</p>
                            {/if}
                        </label>
                        <label class="flex-1 px-3 justify-around">
                            <input class="input" type="number" name="roundAmmo" bind:value="{defaultAmmo}" min=2 max=6/>
                            {#if form?.missingAmmo}
                                <p class=" variant-soft-error">required</p>
                            {/if}
                        </label>
                    </div>
                    <div class="flex m-2 p-2">
                        <input class="input flex-1 px-5 mx-5 " type="range" bind:value={defaultStations} min=1 max=6/>
                        <input class="input flex-1 px-5 mx-5" type="range" bind:value={defaultClays} min=2 max=6/>
                        <input class="input flex-1 px-5 mx-5" type="range" bind:value={defaultAmmo} min=2 max=6/>
                    </div>
                    <button type="submit" class="btn variant-filled items-end">+</button>       
                </form>

                <div class="flex flex-wrap justify-around">
                    {#each se.eventFormat as r}
                        <div class="flex-1 card m-3 p-3">
                            <span class="h4">{r.roundName}</span>
                            <div class="flex flex-wrap my-0 mx-2 justify-center">
                                <img class="w-5" src={clay} alt="clay">x{r.roundClays.length}
                            </div>
                            <div class="flex flex-wrap m-2 p-2 justify-center">
                                <img class="w-3" src={shell} alt="shell">x{r.roundAmmo.length}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="flex-1 card p-5 m-5">
                <form method="POST" action="?/addTeamToShootEvent" use:enhance>
                    <input class="variant-form-material" type="hidden" name="id" value={se.eventId}/>
                    <label class="label">
                        <span>Team Name</span>
                        <input class="input" type="text" name="teamName" />
                        {#if form?.missingName}
                            <p class=" variant-soft-error">required</p>
                        {/if}
                        <span>Shooter 1</span>
                        <input class="input" type="text" name="shooter1" />
                        {#if form?.missingS1}
                            <p class=" variant-soft-error">required</p>
                        {/if}
                        <span>Shooter 2</span>
                        <input class="input" type="text" name="shooter2"/>
                        {#if form?.missingS2}
                            <p class=" variant-soft-error">required</p>
                        {/if}
                    </label>
                    <button type="submit" class="btn variant-filled items-end">+</button>       
                </form>
                <div class="flex flex-wrap justify-around">
                    {#each se.eventTeamScores as t}
                        <div class="flex-1 card m-3 p-3">
                            <span class="h2">{t.teamName}</span>
                            <span class="h6">{t.teamShooter1} | {t.teamShooter2}</span>
                            <span class="h6">{t.teamState}</span>
                            
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/each}

<pre>
    {JSON.stringify(data, null, 4)}
</pre>