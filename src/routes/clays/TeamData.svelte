<script>
    import Round from './Round.svelte'
    /**
	 * @type {{ rounds: any[]; teamName: any; shooter1: any; shooter2: any; }}
	 */
     export let teamData;
    /**
     * @type {string}
     */
     export let orientation;
    let brokenClays = 0;
    let totalClays = 0;
    let totalAmmo = 0;
    let shotAmmo = 0;
    teamData.rounds.forEach(r => {
        r.clays.split('').forEach((/** @type {string} */ c) => {
            if (c === 'x') brokenClays+=1;
            totalClays+=1;
        })
        r.ammos.split('').forEach((/** @type {string} */ a) => {
            if (a === 'x') shotAmmo+=1;
            totalAmmo+=1;
        })

    });
</script>

{#if orientation === 'horizontal'}
    <div class="flex m-3 gap-3">
        <div class="flex-1 card card-hover p-4 text-center place-content-center variant-ghost">
            <h2>{teamData.teamName}</h2>
            <p>{teamData.shooter1} | {teamData.shooter2}</p>
        </div>
        <span class="divider-vertical" />
        <div class="flex-1 card card-hover p-4 text-center my-auto variant-ghost">
            <h2>Score</h2>
            <p>
                Clays: {brokenClays}/{totalClays} : {Math.round(brokenClays/totalClays * 100)}% | 
                Ammo: {brokenClays}/{shotAmmo} : {Math.round(brokenClays/shotAmmo * 100)}%
            </p>
        </div>
    </div>
    
    <div class="flex m-3 gap-3">
        {#each teamData.rounds as round}
            {#if round.roundName === 'Shenanigans'}
                <div class="flex gap-3">
                    <Round roundName={round.roundName} clays={round.clays} ammos={round.ammos} orientation={orientation}></Round>
                </div>
            {:else}
                <Round roundName={round.roundName} clays={round.clays} ammos={round.ammos} orientation={orientation}></Round>
            {/if}
        {/each}
    </div>
    <hr class="!border-t-4 mx-10 my-3" />
{/if}
    
{#if orientation === 'vertical'}
    <div class="flex flex-col mx-auto gap-2 max-w-2xl ">
        <div class="flex-1 card card-hover p-2 text-justify variant-ghost">
            <h3 class="h3">{teamData.teamName}</h3>
            <h5 class="h5">{teamData.shooter1} | {teamData.shooter2}</h5>
            <h5 class="h5">Clays: {brokenClays}/{totalClays} : {Math.round(brokenClays/totalClays * 100)}%</h5>
            <h5 class="h5">Ammo: {brokenClays}/{shotAmmo} : {Math.round(brokenClays/shotAmmo * 100)}%</h5>
        </div>
        <div class="flex-1 card card-hover my-auto p-2 variant-ghost-error">
            {#each teamData.rounds as round}
                <Round roundName={round.roundName} clays={round.clays} ammos={round.ammos} orientation={orientation}></Round>
            {/each}
        </div>
    </div>
    <hr class="!border-t-4 mx-10 my-3" />		
{/if}