<script lang="ts">
    import { Step, Toast, toastStore, type ToastSettings, Stepper } from '@skeletonlabs/skeleton';
    import { thisEvent } from '$lib/client/localStoragedb'
    import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
    import shell from '$lib/images/shell.svg'
	import clay from '$lib/images/capshield.svg'
    
    export let data: PageData;
    export let form: ActionData;

    let inputStations = 3
    let inputClays = 2
    let inputAmmo = 4
    let inputRoundName = "Round" + ($thisEvent.eventFormat.length + 1)
    let inputTeamName = "Team Name"
    let inputS1 = "Player 1"
    let inputS2 = "Player 2"
    let loading = false
    const uid = Date.now()
    
    function addRound() {
        if (inputRoundName.trim().length === 0 ) inputRoundName = "Round" + ($thisEvent.eventFormat.length + 1)
        $thisEvent.eventFormat = [
            ...$thisEvent.eventFormat,
            {
                roundId: $thisEvent.eventFormat.length + 1,
                roundName: inputRoundName,
                roundAmmo: "-".repeat(inputStations * inputAmmo),
                roundClays: "-".repeat(inputStations * inputClays),
                roundStations: inputStations,
                roundState: "NEW"
            }
        ]
        $thisEvent.eventTeamScores.forEach(team => {
            team.teamScores = $thisEvent.eventFormat
        });
        inputRoundName = "Round" + ($thisEvent.eventFormat.length + 1)
    }
    function undoRound() {
        $thisEvent.eventFormat = $thisEvent.eventFormat.filter((round, roundIndex) => roundIndex !== $thisEvent.eventFormat.length - 1);
        $thisEvent.eventTeamScores.forEach(team => {
            team.teamScores = $thisEvent.eventFormat
        });
        inputRoundName = "Round" + ($thisEvent.eventFormat.length + 1)
    }
    function addTeam() {
        $thisEvent.eventTeamScores = [
            ...$thisEvent.eventTeamScores,
            {
                teamId: $thisEvent.eventTeamScores.length + 1,
                teamName: inputTeamName.trimEnd(),
                teamShooter1: inputS1,
                teamShooter2: inputS2,
                teamState: "NEW",
                teamScores: $thisEvent.eventFormat
            }
        ]
    }
    function undoTeam() {
        $thisEvent.eventTeamScores = $thisEvent.eventTeamScores.filter((team, teamIndex) => teamIndex !== $thisEvent.eventTeamScores.length - 1);
    }

</script>

<div class="flex flex-col max-w-[650px] mx-auto p-5">
    <Stepper>
        <Step>
            <svelte:fragment slot="header">Add Event</svelte:fragment>
            <label class="label">
                <span>Event Name</span>
                <input class="input" type="text" name="eventName" bind:value={$thisEvent.eventName} />
            </label>
            <p class="my-2">
                Click Next to create a new Event with default settings.
            </p>
        </Step>
        <Step>
            <svelte:fragment slot="header">Add Round Format</svelte:fragment>
            Specify number of stations and clays and click + Add Round.  When finished click next to configure Teams
            <!-- todo <AddRound /> -->
            <div class="flex-1 card p-5 m-5">
                    <span class="h3">Event Format</span>
                    <label class="label">
                        <span>Round Name</span>
                        <input class="input" type="text" name="roundName" bind:value={inputRoundName} />
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
                    </div>
                    <div class="flex m-2 p-2">
                        <div class="flex-1 px-3 justify-around">
                            <input class="input" type="number" name="roundStations" bind:value={inputStations} min=1 max=6/>
                        </div>
                        <div class="flex-1 px-3 justify-around">
                            <input class="input" type="number" name="roundClays" bind:value={inputClays} min=2 max=6/>
                        </div>
                    </div>
                    <div class="flex m-2 p-2">
                        <input class="input flex-1 px-5 mx-5 " type="range" bind:value={inputStations} min=1 max=6/>
                        <input class="input flex-1 px-5 mx-5" type="range" bind:value={inputClays} min=2 max=6/>
                    </div>
                    <div class="flex m-1 p-1 justify-end">
                        <button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={addRound}>+ Round</button>       
                        <button type="button" class="flex mx-1 btn variant-ghost-tertiary" on:click={undoRound}>🔙 Undo</button>       
                    </div>
                    <div class="flex m-1 p-1">
                    </div>
                    
                <div class="flex flex-wrap justify-around">
                    {#each $thisEvent.eventFormat as r}
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

        </Step>
        <Step>
            <svelte:fragment slot="header">Add Teams</svelte:fragment>
            Add Team Name and Shooter information and click + Add Team.  When finished click next to view a summary.
            <!-- todo <AddTeam /> -->
            <div class="flex-1 card p-5 m-5">
                <span class="h3">Event Format</span>
                <label class="label">
                    <span>Round Name</span>
                    <input class="input" type="text" name="teamName" bind:value={inputTeamName} />
                    <span>Shooter 1</span>
                    <input class="input" type="text" name="shooter1Name" bind:value={inputS1} />
                    <span>Shooter 2</span>
                    <input class="input" type="text" name="shooter2Name" bind:value={inputS2} />
                </label>
                <div class="flex m-1 p-1 justify-end">
                    <button type="button" class="flex mx-1 btn variant-ghost-secondary" on:click={addTeam}>+ Team</button>       
                    <button type="button" class="flex mx-1 btn variant-ghost-tertiary" on:click={undoTeam}>🔙 Undo</button>       
                </div>
            </div>
            <!-- todo <AddTeam /> -->
        </Step>
        <Step>
            <svelte:fragment slot="header">Summary</svelte:fragment>
            Review event summary.  Click back to make any changes, otherwise click Complete to begin event!
            <!-- todo <ShowSummary /> -->
        </Step>
    </Stepper>

    <pre>
        {JSON.stringify($thisEvent, null, 4)}
    </pre>
</div>

<!-- todo <StartEvent /> -->


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
                <form method="POST" action="?/addRoundToShootEvent" >
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
                        <!-- <label class="flex-1 justify-around">
                            <span class="chip">Ammo per Station</span>
                        </label> -->
                    </div>
                    <div class="flex m-2 p-2">
                        <div class="flex-1 px-3 justify-around">
                            <input class="input" type="number" name="roundStations" bind:value={inputStations} min=1 max=6/>
                            {#if form?.missingStations}
                                <p class=" variant-soft-error">required</p>
                            {/if}
                        </div>
                        <div class="flex-1 px-3 justify-around">
                            <input class="input" type="number" name="roundClays" bind:value="{inputClays}" min=2 max=6/>
                            {#if form?.missingClays}
                            <p class=" variant-soft-error">required</p>
                            {/if}
                        </div>
                        <!-- <label class="flex-1 px-3 justify-around">
                            <input class="input" type="number" name="roundAmmo" bind:value="{defaultAmmo}" min=2 max=6/>
                            {#if form?.missingAmmo}
                                <p class=" variant-soft-error">required</p>
                                {/if}
                            </label> -->
                    </div>
                    <div class="flex m-2 p-2">
                        <input class="input flex-1 px-5 mx-5 " type="range" bind:value={inputStations} min=1 max=6/>
                        <input class="input flex-1 px-5 mx-5" type="range" bind:value={inputClays} min=2 max=6/>
                        <!-- <input class="input flex-1 px-5 mx-5" type="range" bind:value={defaultAmmo} min=2 max=6/> -->
                    </div>
                    <div class="flex m-1 p-1">
                        <button type="submit" class="flex mx-auto btn variant-ghost-secondary items-end">+ Round</button>       
                    </div>
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
                        <!-- Team Name -->
                        <div class="flex mx-5 p-3">
                            <div class="label flex-1">
                                <span>Team Name</span>
                                <input class="input" type="text" name="teamName" />
                                {#if form?.missingName}
                                   <p class=" variant-soft-error">required</p>
                                {/if}
                            </div>
                        </div>
                        <!-- Shooter Labels -->
                        <div class="flex mx-5 p-3">
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="flex-1 mx-5 justify-around">
                                <span class="label">Shooter 1</span>
                            </label>
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <label class="flex-1 mx-5 justify-around">
                                <span class="label">Shooter 2</span>
                            </label>
                        </div>
                        <div class="flex mx-5 p-3">
                            <div class="flex-1 mx-2">
                                <input class="input" type="text" name="shooter1" />
                                {#if form?.missingS1}
                                    <p class=" variant-soft-error">required</p>
                                {/if}
                            </div>
                            <div class="flex-1 mx-2">
                                <input class="input" type="text" name="shooter2" />
                                {#if form?.missingS2}
                                    <p class=" variant-soft-error">required</p>
                                {/if}
                            </div>
                        </div>
                        <div class="flex mx-5 p-5">
                            <button type="submit" class="btn variant-ghost-secondary items-end mx-auto">+ Team</button>       
                        </div>
                </form>
                <div class="flex justify-around">
                    {#each se.eventTeamScores as t}
                        <div class="flex flex-col card m-3 p-3 text-center justify-around">
                                <span class="h4">{t.teamName}</span>
                                <span class="h6">{t.teamShooter1} | {t.teamShooter2}</span>
                                <span class="h6">{t.teamState}</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/each}
