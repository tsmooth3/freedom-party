<script lang="ts">
    import { Step, Toast, toastStore, type ToastSettings, Stepper } from '@skeletonlabs/skeleton';
    import type { ActionData, PageData, SubmitFunction } from './$types';
	import { enhance } from '$app/forms';
    import shell from '$lib/images/shell.svg'
	import clay from '$lib/images/capshield.svg'

    
    export let data: PageData;
    export let form: ActionData;

    let loading = false
    
    const t: ToastSettings = {
        message: 'Success',
        hideDismiss: true,
        timeout: 1000,
        background: 'variant-ghost-success'
    };

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

<div class="m-10">
    <form method="POST" action="?/addShootEvent" use:enhance={addEvent}>
        <button class="btn variant-filled-primary" type="submit">New Event</button>
    </form>
</div>
{#each data.shootEvents as se}
    <div class="container flex flex-col my-auto mx-10 p-10 justify-around">
        <div class="flex-1 card p-10">
            {se.eventDate.toString()}
            <form method="POST" action="?/removeShootEvent" use:enhance>
                <input type="hidden" name="id" value={se.eventId}/>
                <button class="btn variant-ghost-error" type="submit">Remove Event</button>
            </form>

            <div class="flex-1 card p-5 m-5">
                <form method="POST" action="?/addRoundToShootEvent" use:enhance={addEvent}>
                    <input class="variant-form-material" type="hidden" name="id" value={se.eventId}/>
                    <label class="label">
                        <span>Round Name</span>
                        <input class="input" type="text" name="roundName" value="Round{se.eventFormat.length + 1}" />
                        <span>Ammo</span>
                        <input class="input" type="text" name="roundAmmo" value="12" />
                        {#if form?.missingAmmo}
                            <p class=" variant-soft-error">required</p>
                        {/if}
                        <span>Clays</span>
                        <input class="input" type="text" name="roundClays" value="6" />
                        {#if form?.missingClays}
                            <p class=" variant-soft-error">required</p>
                        {/if}
                    </label>
                    <button type="submit" class="btn variant-filled items-end">+</button>       
                </form>

                <div class="flex flex-wrap justify-around">
                    {#each se.eventFormat as r}
                        <div class="flex-1 card m-3 p-3">
                            <span class="h2">{r.roundName}</span>
                            <div class="flex flex-wrap my-0 mx-2 justify-around">
                                {#each r.roundClays.split('') as c}
                                    <img class="w-5" src={clay} alt="clay">
                                {/each}
                            </div>
                            <div class="flex flex-wrap m-2 p-2 justify-center">
                                {#each r.roundAmmo.split('') as a}
                                    <img class="w-3" src={shell} alt="shell">
                                {/each}
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
                            <span class="h6">{t.shooter1} | {t.shooter2}</span>
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