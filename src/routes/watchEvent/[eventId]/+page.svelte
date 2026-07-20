<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { prismaShootEvent, prismaEventRound } from '$lib/shared/utils';
	import ScoreBoard from '$lib/components/ScoreBoard.svelte';
	import doglaugh from '$lib/images/doglaugh.gif';
	import blankMenu from '$lib/images/blank_menu.png';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let screenSize = $state<number>(1024);
	let interval: number;

	let dbShootEvents = $state<prismaShootEvent[] | null>(null);
	let dbEventRounds = $state<prismaEventRound[] | null>(null);
	let dynamicEventData = $state<any | null>(null);

	const isComplete = $derived(dynamicEventData?.eventState === 'COMPLETE');

	/** Winner + tie-break copy for completed header. */
	const completeSummary = $derived.by(() => {
		const board = dynamicEventData?.teams;
		if (!Array.isArray(board) || board.length === 0) return null;
		const winner = board[0];
		const second = board[1] ?? null;
		if (!second) {
			return { winner, second: null, tied: false, tieBreak: null as string | null, margin: null as number | null };
		}
		const tiedOnScore = winner.totalHit === second.totalHit;
		let tieBreak: string | null = null;
		if (tiedOnScore) {
			if ((winner.perfectStands ?? 0) !== (second.perfectStands ?? 0)) {
				tieBreak = `Tie broken by perfect stands (${winner.perfectStands} vs ${second.perfectStands})`;
			} else if ((winner.perfectPresentations ?? 0) !== (second.perfectPresentations ?? 0)) {
				tieBreak = `Tie broken by perfect presentations (${winner.perfectPresentations} vs ${second.perfectPresentations})`;
			} else {
				tieBreak = 'Tied on score, perfect stands, and perfect presentations (name order)';
			}
		}
		return {
			winner,
			second,
			tied: tiedOnScore,
			tieBreak,
			margin: tiedOnScore ? 0 : winner.totalHit - second.totalHit
		};
	});

	/** Race math for the team currently shooting (active events). */
	const shootingRace = $derived.by(() => {
		if (!dynamicEventData || dynamicEventData.eventState === 'COMPLETE') return null;
		const stations = dynamicEventData.stations ?? [];
		const board: any[] = dynamicEventData.teams ?? [];
		const raw: any[] = dynamicEventData.rawTeams ?? [];
		const idx = dynamicEventData.currentTeamIndex ?? 0;
		const shooting = raw[idx] ?? board.find((t) => t.id === raw[idx]?.id) ?? null;
		if (!shooting || !stations.length) return null;

		// Prefer leaderboard row (has totals); fall back to shooting object
		const me = board.find((t) => t.id === shooting.id) ?? shooting;
		const myHit = me.totalHit ?? 0;

		let pointsLeft = 0;
		let presentationsLeft = 0;
		for (const st of stations) {
			const pres: (number | null)[] =
				me.presentationScores?.[st.stationIndex] ??
				shooting.presentationScores?.[st.stationIndex] ??
				[null, null, null];
			for (let p = 0; p < 3; p++) {
				if (pres[p] === null || pres[p] === undefined) {
					pointsLeft += st.totalClays;
					presentationsLeft += 1;
				}
			}
		}

		const others = board.filter((t) => t.id !== me.id);
		const bestOther = others.length ? Math.max(...others.map((t) => t.totalHit ?? 0)) : 0;
		const isLeader = myHit > bestOther || others.length === 0;
		const isTiedForLead = myHit === bestOther && others.length > 0;
		const leaderHit = Math.max(myHit, bestOther);
		const behind = Math.max(0, leaderHit - myHit);
		const aheadBy = isLeader && !isTiedForLead ? myHit - bestOther : 0;
		const needToTie = behind;
		const needToPass = isLeader && !isTiedForLead ? 0 : behind + 1;
		const canTie = needToTie === 0 || pointsLeft >= needToTie;
		const canPass = needToPass === 0 || pointsLeft >= needToPass;

		return {
			teamName: me.teamName ?? shooting.teamName,
			myHit,
			bestOther,
			leaderHit,
			behind,
			aheadBy,
			isLeader,
			isTiedForLead,
			pointsLeft,
			presentationsLeft,
			needToTie,
			needToPass,
			canTie,
			canPass,
			maxFinish: myHit + pointsLeft
		};
	});

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
		interval = window.setInterval(fetchData, 5000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	function isPerfectPres(hit: number | null | undefined, totalClays: number): boolean {
		return hit !== null && hit !== undefined && hit === totalClays;
	}
</script>

<svelte:window bind:innerWidth={screenSize} />

<div class="container mx-auto p-3 sm:p-4 max-w-4xl overflow-x-hidden w-full">
	{#if data.isDynamic}
		{#if dynamicEventData}
			<div class="space-y-5 sm:space-y-6">
				<!-- Header: compact fixed structure for active + complete -->
				<div class="bg-indigo-600 text-white rounded-2xl shadow-xl overflow-hidden">
					<!-- Title row -->
					<div class="px-4 pt-3 pb-2 flex flex-wrap items-center justify-between gap-2">
						<div class="flex items-center gap-2 min-w-0">
							<span class="text-[9px] font-bold uppercase tracking-widest text-indigo-200 bg-indigo-500/50 px-2 py-0.5 rounded-full shrink-0">
								🏆 5-Stand
							</span>
							<h1 class="text-base sm:text-lg font-black uppercase tracking-wide truncate">
								{dynamicEventData.eventName}
							</h1>
						</div>
						<div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0">
							{#if isComplete}
								<span class="text-indigo-100">Status</span>
								<span class="bg-emerald-500/90 px-2 py-0.5 rounded font-black text-white">COMPLETE</span>
							{:else}
								{@const standNum = (dynamicEventData.stations?.[dynamicEventData.currentStationIndex]?.stationIndex)
									?? (dynamicEventData.currentStationIndex + 1)}
								{@const standSeq = dynamicEventData.stations?.[dynamicEventData.currentStationIndex]?.sequence || ''}
								<span class="text-indigo-100">Stand #{standNum}{standSeq ? ` · ${standSeq}` : ''}</span>
								<span class="bg-indigo-800/80 px-2 py-0.5 rounded font-black text-white">{dynamicEventData.eventState}</span>
							{/if}
						</div>
					</div>

					<!-- Status strip: same min-height whether winner or live panels -->
					<div class="px-3 pb-3">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 min-h-[4.75rem]">
							{#if isComplete && (completeSummary?.winner || dynamicEventData.winner)}
								{@const w = completeSummary?.winner ?? dynamicEventData.winner}
								<div class="sm:col-span-2 rounded-xl bg-indigo-700/45 border border-indigo-400/25 px-3 py-2.5 space-y-2">
									<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
										<div class="min-w-0">
											<span class="text-[9px] font-bold uppercase tracking-widest text-yellow-300">🥇 Winner</span>
											<p class="text-sm font-black uppercase tracking-wide truncate">{w.teamName}</p>
											<p class="text-[11px] text-indigo-100/90">{w.shooter1} • {w.shooter2}</p>
											{#if w.perfectStands != null}
												<p class="text-[10px] font-semibold text-indigo-200/90 mt-0.5">
													{w.perfectStands} perfect stands · {w.perfectPresentations ?? 0} perfect pres
												</p>
											{/if}
										</div>
										<div class="text-right shrink-0">
											<p class="tabular-nums">
												<span class="text-xl font-black">{w.totalHit}</span>
												<span class="text-xs text-indigo-200">/{w.totalPossible}</span>
											</p>
											<p class="text-sm font-extrabold text-emerald-300 tabular-nums">
												{w.accuracy}%
												<span class="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">acc</span>
											</p>
										</div>
									</div>
									{#if completeSummary?.tied && completeSummary.tieBreak}
										<div class="rounded-lg border border-amber-300/35 bg-amber-400/15 px-2.5 py-1.5">
											<p class="text-[9px] font-bold uppercase tracking-wider text-amber-200">Tie-breaker</p>
											<p class="text-[11px] sm:text-xs font-semibold text-white/95 mt-0.5">{completeSummary.tieBreak}</p>
											{#if completeSummary.second}
												<p class="text-[10px] text-indigo-100/85 mt-0.5">
													2nd {completeSummary.second.teamName}: {completeSummary.second.totalHit}/{completeSummary.second.totalPossible}
													· {completeSummary.second.perfectStands ?? 0} perfect stands
													· {completeSummary.second.perfectPresentations ?? 0} perfect pres
												</p>
											{/if}
										</div>
									{:else if completeSummary?.margin != null && completeSummary.margin > 0 && completeSummary.second}
										<p class="text-[11px] font-semibold text-indigo-100/90">
											Won by <span class="tabular-nums text-white">{completeSummary.margin}</span> over {completeSummary.second.teamName}
										</p>
									{/if}
									<p class="text-[9px] font-medium text-indigo-200/80">
										Rank order: total hits → perfect stands → perfect presentations
									</p>
								</div>
							{:else}
								{@const currentTeam = dynamicEventData.rawTeams?.[dynamicEventData.currentTeamIndex]}
								{@const onDeckTeam = dynamicEventData.rawTeams?.[dynamicEventData.currentTeamIndex + 1]}
								{@const standNum = (dynamicEventData.stations?.[dynamicEventData.currentStationIndex]?.stationIndex)
									?? (dynamicEventData.currentStationIndex + 1)}
								{@const standSeq = dynamicEventData.stations?.[dynamicEventData.currentStationIndex]?.sequence || ''}
								<div class="rounded-xl bg-indigo-700/40 border border-indigo-500/30 px-3 py-2 space-y-0.5 min-h-[4.75rem]">
									<span class="text-[9px] font-bold uppercase tracking-widest text-green-300">🟢 Now Shooting</span>
									{#if currentTeam}
										<p class="text-sm font-black uppercase tracking-wide truncate">{currentTeam.teamName}</p>
										<p class="text-[11px] text-indigo-100 font-medium truncate">{currentTeam.shooter1} • {currentTeam.shooter2}</p>
										<p class="text-[10px] font-bold text-indigo-200">Stand #{standNum}{standSeq ? ` (${standSeq})` : ''}</p>
									{:else}
										<p class="text-xs text-indigo-200 pt-1">No active team</p>
									{/if}
								</div>
								<div class="rounded-xl bg-indigo-700/20 border border-indigo-500/20 px-3 py-2 space-y-0.5 min-h-[4.75rem]">
									<span class="text-[9px] font-bold uppercase tracking-widest text-yellow-300">🟡 On Deck</span>
									{#if onDeckTeam}
										<p class="text-sm font-black uppercase tracking-wide text-indigo-100 truncate">{onDeckTeam.teamName}</p>
										<p class="text-[11px] text-indigo-200/80 font-medium truncate">{onDeckTeam.shooter1} • {onDeckTeam.shooter2}</p>
										<p class="text-[10px] font-bold text-indigo-300">Next up · Stand #{standNum}</p>
									{:else}
										<p class="text-sm font-black uppercase text-indigo-300 pt-0.5">End of rotation</p>
										<p class="text-[11px] text-indigo-300/80">All teams through this stand</p>
									{/if}
								</div>
							{/if}
						</div>

						{#if !isComplete && shootingRace}
							{@const race = shootingRace}
							<div class="mt-2 rounded-xl border border-indigo-400/30 bg-indigo-950/35 px-3 py-2.5 space-y-2">
								<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
									<p class="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
										Race · <span class="text-white">{race.teamName}</span>
									</p>
									<p class="text-[11px] font-semibold text-indigo-100">
										<span class="tabular-nums font-black text-white">{race.pointsLeft}</span> pts left
										<span class="text-indigo-300">· {race.presentationsLeft} pres</span>
									</p>
								</div>
								<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold">
									{#if race.isLeader && !race.isTiedForLead}
										<span class="text-emerald-300">Leading by <span class="tabular-nums">{race.aheadBy}</span></span>
									{:else if race.isTiedForLead}
										<span class="text-amber-300">Tied for lead</span>
									{:else}
										<span class="text-rose-300">
											<span class="tabular-nums">{race.behind}</span> behind leader
											<span class="text-indigo-200 font-semibold">({race.leaderHit})</span>
										</span>
									{/if}
									<span class="text-indigo-200/90 font-semibold">
										Max finish <span class="tabular-nums text-white">{race.maxFinish}</span>
									</span>
								</div>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] sm:text-[11px]">
									<div class="rounded-lg px-2 py-1.5 border {race.canTie ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100' : 'border-white/10 bg-black/20 text-indigo-200/70'}">
										{#if race.needToTie === 0}
											<span class="font-bold">Tie:</span> already at/above lead
										{:else}
											<span class="font-bold">Need {race.needToTie} to tie</span>
											<span class="opacity-90"> · {race.canTie ? 'possible' : 'not possible'}</span>
										{/if}
									</div>
									<div class="rounded-lg px-2 py-1.5 border {race.canPass ? 'border-sky-300/40 bg-sky-400/15 text-sky-100' : 'border-white/10 bg-black/20 text-indigo-200/70'}">
										{#if race.needToPass === 0}
											<span class="font-bold">Pass:</span> sole lead if they hold
										{:else}
											<span class="font-bold">Need {race.needToPass} to pass</span>
											<span class="opacity-90"> · {race.canPass ? 'possible' : 'not possible'}</span>
										{/if}
									</div>
								</div>
							</div>
						{/if}

						{#if !isComplete}
							<!-- Active stand menu diagram -->
							<div class="mt-2 rounded-xl overflow-hidden border border-indigo-400/25 bg-indigo-950/30">
								<img
									src={blankMenu}
									alt="Stand menu layout"
									class="block w-full h-auto max-h-[min(42vh,360px)] object-contain mx-auto"
								/>
							</div>
						{/if}
					</div>
				</div>

				<!-- Standings -->
				<div
					class="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
				>
					<div
						class="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/10"
					>
						<h2 class="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
							{isComplete ? 'Final Standings' : 'Current Standings'}
						</h2>
						{#if !isComplete}
							<span class="text-xs text-zinc-500 animate-pulse flex items-center gap-1 shrink-0">
								<span class="h-2 w-2 bg-green-500 rounded-full"></span> Live
							</span>
						{:else}
							<span class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0"
								>Final</span
							>
						{/if}
					</div>

					<!-- Desktop / wide table -->
					<div class="hidden md:block overflow-x-auto">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr
									class="text-xs font-bold uppercase text-zinc-400 bg-zinc-50/30 dark:bg-zinc-900/5 border-b border-zinc-100 dark:border-zinc-800"
								>
									<th class="py-3 px-4">Rank</th>
									<th class="py-3 px-4">Team & Shooters</th>
									{#each dynamicEventData.stations as station}
										<th class="py-3 px-3 text-center">Stand {station.stationIndex}</th>
									{/each}
									<th class="py-3 px-4 text-right">Total</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
								{#each dynamicEventData.teams as team, index}
									<tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/5 transition">
										<td class="py-3 px-4 font-black align-top">
											{#if index === 0}
												<span class="text-yellow-500 text-lg">🥇</span>
											{:else if index === 1}
												<span class="text-zinc-400 text-base">🥈</span>
											{:else if index === 2}
												<span class="text-amber-700 text-base">🥉</span>
											{:else}
												<span class="text-zinc-400 text-sm">#{index + 1}</span>
											{/if}
										</td>
										<td class="py-3 px-4 align-top">
											<p
												class="font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide text-sm"
											>
												{team.teamName}
											</p>
											<p class="text-xs text-zinc-400 font-medium">
												{team.shooter1} • {team.shooter2}
											</p>
											<p class="text-[10px] text-zinc-400 mt-0.5 font-semibold">
												{team.accuracy}% acc · {team.perfectStands} perfect stands · {team.perfectPresentations} perfect pres
											</p>
										</td>
										{#each dynamicEventData.stations as station}
											<td class="py-3 px-3 text-center align-top">
												{#if team.scores[station.stationIndex] !== undefined}
													<span
														class="inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs {team
															.scores[station.stationIndex] === station.totalClays * 3
															? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
															: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'}"
													>
														{team.scores[station.stationIndex]}
													</span>
													<p class="mt-1 text-[10px] font-bold tabular-nums tracking-tight" title="Presentations 1 · 2 · 3">
														{#each (team.presentationScores?.[station.stationIndex] ?? [null, null, null]) as hit, pi}
															{#if pi > 0}<span class="text-zinc-400 dark:text-zinc-600"> · </span>{/if}
															<span class={isPerfectPres(hit, station.totalClays) ? 'text-green-600 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}>
																{hit === null || hit === undefined ? '–' : hit}
															</span>
														{/each}
													</p>
												{:else}
													<span class="text-zinc-300 dark:text-zinc-800 text-xs">-</span>
												{/if}
											</td>
										{/each}
										<td class="py-3 px-4 text-right align-top">
											<span class="text-base font-black text-indigo-600 dark:text-indigo-400">
												{team.totalHit}
											</span>
											<span class="text-xs text-zinc-400"> / {team.totalPossible} </span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Mobile stacked cards -->
					<div class="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
						{#each dynamicEventData.teams as team, index}
							<div class="p-4 space-y-3">
								<div class="flex items-start justify-between gap-2">
									<div class="flex items-start gap-2 min-w-0">
										<span class="shrink-0 font-black w-7 text-center pt-0.5">
											{#if index === 0}
												🥇
											{:else if index === 1}
												🥈
											{:else if index === 2}
												🥉
											{:else}
												<span class="text-zinc-400 text-sm">#{index + 1}</span>
											{/if}
										</span>
										<div class="min-w-0">
											<p
												class="font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide text-sm break-words"
											>
												{team.teamName}
											</p>
											<p class="text-xs text-zinc-400">{team.shooter1} • {team.shooter2}</p>
											<p class="text-[10px] text-zinc-400 font-semibold">
												{team.accuracy}% acc · {team.perfectStands} perfect stands · {team.perfectPresentations} perfect pres
											</p>
										</div>
									</div>
									<div class="text-right shrink-0">
										<span class="text-lg font-black text-indigo-600 dark:text-indigo-400"
											>{team.totalHit}</span
										>
										<span class="text-xs text-zinc-400">/{team.totalPossible}</span>
									</div>
								</div>

								<div class="grid grid-cols-5 gap-1.5">
									{#each dynamicEventData.stations as station}
										<div class="text-center space-y-1 min-w-0">
											<p class="text-[9px] font-bold uppercase text-zinc-400">S{station.stationIndex}</p>
											{#if team.scores[station.stationIndex] !== undefined}
												<span
													class="inline-flex items-center justify-center h-7 w-7 rounded-full font-bold text-[11px] {team
														.scores[station.stationIndex] === station.totalClays * 3
														? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
														: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'}"
												>
													{team.scores[station.stationIndex]}
												</span>
												<p class="text-[9px] font-bold tabular-nums leading-tight">
													{#each (team.presentationScores?.[station.stationIndex] ?? [null, null, null]) as hit, pi}
														{#if pi > 0}<span class="text-zinc-400">·</span>{/if}
														<span class={isPerfectPres(hit, station.totalClays) ? 'text-green-600 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}>
															{hit === null || hit === undefined ? '–' : hit}
														</span>
													{/each}
												</p>
											{:else}
												<span class="text-zinc-300 text-xs">-</span>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="flex pt-2">
					<img class="flex-1 mx-auto max-w-[500px] w-full" src={doglaugh} alt="duck hunt dog" />
				</div>
			</div>
		{:else}
			<div class="text-center py-20 text-zinc-500 font-semibold">Loading dynamic scoreboard...</div>
		{/if}
	{:else}
		<div>
			{#if dbShootEvents && dbEventRounds}
				<ScoreBoard
					shootEvent={dbShootEvents[0]}
					eventRounds={dbEventRounds}
					screenSize={screenSize}
				/>
				<div class="flex my-auto pt-6">
					<img class="flex-1 mx-auto max-w-[690px] w-full" src={doglaugh} alt="duck hunt dog" />
				</div>
			{:else}
				<div class="text-center py-20 text-zinc-500 font-semibold">Loading legacy scoreboard...</div>
			{/if}
		</div>
	{/if}
</div>
