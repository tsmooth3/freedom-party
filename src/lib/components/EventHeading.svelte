<script lang="ts">
	import type { prismaShootEvent } from "$lib/shared/utils";
	import LegendCompact from "./LegendCompact.svelte";
    export let dbShootEvent: prismaShootEvent;
    let eventName: String = dbShootEvent.eventName;
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'America/New_York'
	};
	let eventDate: Date = dbShootEvent.createdAt;
	const inputDate = new Date(eventDate);
	const formatter = new Intl.DateTimeFormat('en-US', options);
	const formattedDate = formatter.format(inputDate);
    export let shootingTeamName: string;
    export let onDeckTeamName: string;

</script>
<div class="flex m-2 justify-evenly">
    <div class="flex text-left">
        <div class="flex-col my-auto min-w-[190px]">
            <div class="h2">{eventName}</div>
            <div class="h3 text-center">{formattedDate}</div>
        </div>

        <div class="flex m-3 gap-3">
            <div class="flex min-w-[350px] max-w-[800px] px-1 mx-auto my-1">
                <div class="flex justify-evenly mx-auto my-1">
                    <div class="flex-col card variant-ghost-success m-3 p-3">
                        {#if onDeckTeamName === 'All Rounds Complete'}
                            <div class="h3 text-center">Event Winners!</div>
                        {:else if onDeckTeamName === 'Final Round'}
                            <div class="h3 text-center">Final Round</div>
                        {:else}
                            <div class="h3 text-center">Now Shooting</div>
                        {/if}
                        <div class="h3 text-center">{shootingTeamName}</div>
                    </div>
                    {#if onDeckTeamName !== 'All Rounds Complete' && onDeckTeamName !== 'Final Round'}
                        <div class="flex-col card variant-ghost-warning m-3 p-3">
                            <div class="h3 text-center">On-Deck</div>
                            <div class="h3 text-center">{onDeckTeamName}</div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <div class="flex my-auto">
            <LegendCompact/>
        </div>

    </div>
</div>