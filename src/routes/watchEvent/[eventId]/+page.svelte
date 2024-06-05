<script lang="ts">
	import type { prismaShootEvent, prismaTeamScore } from '$lib/shared/utils';
    import { source } from 'sveltekit-sse'
    import type { PageData } from './$types';
	export let data: PageData;

    const connection = source('/custom-event/' + data.id)
    const totalClays = connection.select('totalClays')
    const allRoundsComplete = connection.select('allRoundsComplete')
    const eventName = connection.select('eventName')
    const ShootingTeamRoundName = connection.select('ShootingTeamRoundName')
    const ShootingTeamName = connection.select('ShootingTeamName')
    const ShootingTeamTotal = connection.select('ShootingTeamTotal')
    const ShootingTeamShotsFired = connection.select('ShootingTeamShotsFired')
    const OnDeckTeamName = connection.select('onDeckTeamName')
    let obj: prismaShootEvent
    let eventTeamScores: prismaTeamScore[] 
    const dbShootEvents = connection.select('dbShootEvents')
    $: if($dbShootEvents) { 
        obj = JSON.parse($dbShootEvents)[0]
        eventTeamScores = obj.eventTeamScores 
    } 
</script>

{#if obj?.eventTeamScores}
    <div class="flex flex-col mx-auto gap-2 max-w-2xl">
        <div class="flex-1 card card-hover p-2 text-justify">
            {$eventName}
        </div>
        <div class="flex-1 card card-hover p-2 text-justify">
            {$ShootingTeamRoundName}
        </div>
        <div class="flex-1 card card-hover p-2 text-justify">
            Now Shooting: {$ShootingTeamName}
            <div class="flex-1 card card-hover p-2 text-justify">
                Score: {$ShootingTeamTotal} / {$ShootingTeamShotsFired} : {Number($ShootingTeamTotal) / Number($ShootingTeamShotsFired) * 100}
            </div>
        </div>
        <div class="flex-1 card card-hover p-2 text-justify">
            On Deck: {$OnDeckTeamName}
        </div>
        <div class="flex-1 card card-hover p-2 text-justify">
            {#if obj?.eventTeamScores}
                <ol>
                {#each obj?.eventTeamScores as ets}
                    <li>{ets.teamName} : {ets.teamShooter1} | {ets.teamShooter2} |  {ets.teamTotal} / {ets.teamShotsFired}</li>
                {/each}
                </ol>
            {/if}
        </div>
    </div>
{:else}
    ...loading
{/if}