<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { prismaShootEvent, prismaEventRound } from "$lib/shared/utils";
	import ScoreBoard from '$lib/components/ScoreBoard.svelte';
	import doglaugh from '$lib/images/doglaugh.gif';
	import type { PageData } from './$types';

	// Svelte 5 props
	let { data } = $props<{ data: PageData }>();

	let screenSize = $state<number>(1024);
	let interval: number;

	// Legacy state
	let dbShootEvents = $state<prismaShootEvent[] | null>(null);
	let dbEventRounds = $state<prismaEventRound[] | null>(null);

	// Dynamic state
	let dynamicEventData = $state<any | null>(null);

	async function fetchData(): Promise<void> {
		if (data.isDynamic) {
			try {
				const response = await fetch(`/api/shootEvents/dynamic/${data.id}`);
				if (response.ok) {
					dynamicEventData = await response.json();
				}
			} catch (error) {
				console.error('Error fetching dynamic event data:', error);
			}
		} else {
			try {
				const response = await fetch('/api/shootEvents/byLeader/' + data.id);
				if (response.ok) {
					dbShootEvents = await response.json();
				}
			} catch (error) {
				console.error(error);
			}
			try {
				const response2 = await fetch('/api/eventRounds/' + data.id);
				if (response2.ok) {
					dbEventRounds = await response2.json();
				}
			} catch (error) {
				console.error(error);
			}
		}
	}

	onMount(() => {
		fetchData();
		interval = window.setInterval(fetchData, 5000); // Poll every 5 seconds
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<svelte:window bind:innerWidth={screenSize} />

<div class="container mx-auto p-4 max-w-4xl">
	{#if data.isDynamic}
		<!-- DYNAMIC LEADERBOARD (Team 5-Stand) -->
		{#if dynamicEventData}
			<div class="space-y-6">
				<!-- Event Title Card -->
				<div class="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl space-y-2 text-center md:text-left">
					<span class="text-xs font-bold uppercase tracking-widest text-indigo-200 bg-indigo-500/40 px-3 py-1 rounded-full">
						🏆 Team 5-Stand Leaderboard
					</span>
					<h1 class="text-2xl md:text-3xl font-black uppercase tracking-wide mt-2">{dynamicEventData.eventName}</h1>
					<p class="text-xs text-indigo-100 uppercase tracking-widest">{dynamicEventData.roundName} • Status: <span class="bg-indigo-700/60 px-2 py-0.5 rounded font-black text-white">{dynamicEventData.eventState}</span></p>
				</div>

				<!-- Shooting & On Deck Live Tracking Header -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Active Shooter -->
					<div class="p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow space-y-2">
						<span class="text-[10px] font-bold uppercase tracking-widest text-green-400 block">🟢 Now Shooting</span>
						{#if dynamicEventData.rawTeams && dynamicEventData.rawTeams[dynamicEventData.currentTeamIndex]}
							{@const currentTeam = dynamicEventData.rawTeams[dynamicEventData.currentTeamIndex]}
							<h3 class="text-lg font-black uppercase text-indigo-400">{currentTeam.teamName}</h3>
							<p class="text-xs text-zinc-300 font-medium">{currentTeam.shooter1} • {currentTeam.shooter2}</p>
							<p class="text-xs font-bold text-zinc-400">At Stand #{dynamicEventData.currentStationIndex + 1} ({dynamicEventData.stations[dynamicEventData.currentStationIndex]?.sequence || ''})</p>
						{:else}
							<p class="text-sm font-semibold text-zinc-400">No active team</p>
						{/if}
					</div>

					<!-- On Deck -->
					<div class="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow space-y-2">
						<span class="text-[10px] font-bold uppercase tracking-widest text-yellow-500 block">🟡 On Deck</span>
						{#if dynamicEventData.rawTeams && dynamicEventData.rawTeams[dynamicEventData.currentTeamIndex + 1]}
							{@const onDeckTeam = dynamicEventData.rawTeams[dynamicEventData.currentTeamIndex + 1]}
							<h3 class="text-lg font-black uppercase text-zinc-300">{onDeckTeam.teamName}</h3>
							<p class="text-xs text-zinc-400 font-medium">{onDeckTeam.shooter1} • {onDeckTeam.shooter2}</p>
							<p class="text-xs font-bold text-zinc-500">Preparing for Stand #1</p>
						{:else}
							<h3 class="text-lg font-black uppercase text-zinc-500">End of Round</h3>
							<p class="text-xs text-zinc-500 font-medium">All teams have rotated through the stands.</p>
							<p class="text-xs font-bold text-zinc-600">-</p>
						{/if}
					</div>
				</div>

				<!-- Leaderboard Table -->
				<div class="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
					<div class="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/10">
						<h2 class="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Current Standings</h2>
						<span class="text-xs text-zinc-500 animate-pulse flex items-center gap-1">
							<span class="h-2 w-2 bg-green-500 rounded-full"></span> Live Updates Active
						</span>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="text-xs font-bold uppercase text-zinc-400 bg-zinc-50/30 dark:bg-zinc-900/5 border-b border-zinc-100 dark:border-zinc-800">
									<th class="py-3 px-4">Rank</th>
									<th class="py-3 px-4">Team & Shooters</th>
									{#each dynamicEventData.stations as station}
										<th class="py-3 px-4 text-center">Stand {station.stationIndex}</th>
									{/each}
									<th class="py-3 px-4 text-right">Total Score</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
								{#each dynamicEventData.teams as team, index}
									<tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/5 transition">
										<!-- Rank -->
										<td class="py-4 px-4 font-black">
											{#if index === 0}
												<span class="text-yellow-500 text-lg">🥇</span>
											{:else}
												<span class="text-zinc-400 text-sm">#{index + 1}</span>
											{/if}
										</td>
										<!-- Team Info -->
										<td class="py-4 px-4">
											<p class="font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide text-sm">{team.teamName}</p>
											<p class="text-xs text-zinc-400 font-medium">{team.shooter1} • {team.shooter2}</p>
										</td>
										<!-- Station Scores -->
										{#each dynamicEventData.stations as station}
											<td class="py-4 px-4 text-center">
												{#if team.scores[station.stationIndex] !== undefined}
													<span class="inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs {team.scores[station.stationIndex] === station.totalClays ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'}">
														{team.scores[station.stationIndex]}
													</span>
												{:else}
													<span class="text-zinc-300 dark:text-zinc-800 text-xs">-</span>
												{/if}
											</td>
										{/each}
										<!-- Total -->
										<td class="py-4 px-4 text-right">
											<span class="text-base font-black text-indigo-600 dark:text-indigo-400">
												{team.totalHit}
											</span>
											<span class="text-xs text-zinc-400">
												/ {team.totalPossible}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<!-- Fun visual footer -->
				<div class="flex pt-4">
					<img class="flex-1 mx-auto max-w-[500px]" src={doglaugh} alt="duck hunt dog" />
				</div>
			</div>
		{:else}
			<div class="text-center py-20 text-zinc-500 font-semibold">
				Loading dynamic scoreboard...
			</div>
		{/if}
	{:else}
		<!-- LEGACY SCOREBOARD (Backward Compatible) -->
		<div>
			{#if dbShootEvents && dbEventRounds}
				<ScoreBoard shootEvent={dbShootEvents[0]} eventRounds={dbEventRounds} screenSize={screenSize}/>
				<div class="flex my-auto min-w-[390px] pt-6">
					<img class="flex-1 mx-auto min-w-[390px] max-w-[690px]" src={doglaugh} alt="duck hunt dog" />
				</div>
			{:else}
				<div class="text-center py-20 text-zinc-500 font-semibold">
					Loading legacy scoreboard...
				</div>
			{/if}
		</div>
	{/if}
</div>
