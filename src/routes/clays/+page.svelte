<script lang="ts">
	import LegendCompact from '$lib/components/LegendCompact.svelte';
	import TeamData from '$lib/components/TeamData.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import doglaugh from '$lib/images/doglaugh.gif';
	import clay from '$lib/images/capshield.svg';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	// Images for active dynamic visual displays
	import blankMenu from '$lib/images/blank_menu.png';

	// Svelte 5 props
	let { data } = $props<{ data: PageData }>();

	let screenSize = $state<number>(1024);

	// Tabs: 'dynamic' or 'legacy'
	let activeTab = $state<'dynamic' | 'legacy'>('dynamic');

	// Active Dynamic Event & Scoring state
	let selectedEvent = $state<any | null>(null);
	let activeTeamIndex = $state<number>(0);
	let activeStationIndex = $state<number>(0);
	let activePresentationIndex = $state<number>(0); // 0, 1, or 2 (for 3 presentations per station)
	let isSaving = $state<boolean>(false);
	let scoringError = $state<string>('');
	let scoreUpdateSuccess = $state<boolean>(false);

	// Score log
	let tempScoreInput = $state<number | null>(null);

	// Mobile: active-event header collapses to icon row by default
	let headerExpanded = $state(false);
	const isMobile = $derived(screenSize < 768);
	/** Once an event has been completed, Event Setup stays blocked even after unlock-for-edit. */
	let allowEventSetup = $state(true);
	const isSignedIn = $derived(Boolean(data.user));
	const isEventComplete = $derived(selectedEvent?.eventState === 'COMPLETE');
	const showScoringUI = $derived(Boolean(selectedEvent) && !isEventComplete && isSignedIn);

	// Trap coordinates mapped precisely to the blank_menu layout template
	const trapCoordinates: Record<number, { x: number; y: number }> = {
		1: { x: 17, y: 10 },
		2: { x: 83, y: 10 },
		3: { x: 82, y: 80 },
		4: { x: 50, y: 92 },
		5: { x: 18, y: 80 }
	};
	// Shooter Stand Center coordinate
	const shooterStand = { x: 50, y: 73 };

	// Launch checkboxes coordinates on blank_menu template
	const launchTypeCheckboxes: Record<string, { x: number; y: number }> = {
		'REPORT_TRIPLE': { x: 23.3, y: 6.3 },
		'TRIPLE_1_PLUS_2': { x: 54.4, y: 6.3 },
		'TRIPLE_2_PLUS_1': { x: 23.3, y: 11.2 },
		'QUAD_2_PLUS_2': { x: 54.4, y: 11.2 }
	};

	// Derived states using runes
	const activeTeam = $derived(selectedEvent ? selectedEvent.teams[activeTeamIndex] : null);
	const activeStation = $derived(selectedEvent?.round ? selectedEvent.round.stations[activeStationIndex] : null);
	const totalStations = $derived(selectedEvent?.round ? selectedEvent.round.stations.length : 0);
	const totalTeams = $derived(selectedEvent ? selectedEvent.teams.length : 0);

	function getStandTotal(team: any, stationId: number) {
		if (!team || !team.stationScores) return 0;
		return team.stationScores
			.filter((ss: any) => ss.stationLayoutId === stationId)
			.reduce((sum: number, ss: any) => sum + ss.claysHit, 0);
	}

	const teamStandTotals = $derived(
		(selectedEvent && activeTeam && selectedEvent.round?.stations)
			? selectedEvent.round.stations.map((st: any) => {
				const hit = getStandTotal(activeTeam, st.id);
				const max = st.totalClays * 3;
				return { stationIndex: st.stationIndex, id: st.id, hit, max };
			  })
			: []
	);

	const teamTotalHit = $derived(
		(activeTeam && activeTeam.stationScores)
			? activeTeam.stationScores.reduce((sum: number, ss: any) => sum + ss.claysHit, 0)
			: 0
	);

	const teamTotalPossible = $derived(
		selectedEvent?.round?.stations
			? selectedEvent.round.stations.reduce((sum: number, st: any) => sum + (st.totalClays * 3), 0)
			: 0
	);

	/** True when every team has complete scores for all 3 presentations on every stand. */
	const canFinalizeEvent = $derived.by(() => {
		if (!selectedEvent?.teams?.length || !selectedEvent?.round?.stations?.length) return false;
		const stations = selectedEvent.round.stations;
		for (const team of selectedEvent.teams) {
			for (const st of stations) {
				for (let p = 1; p <= 3; p++) {
					const score = team.stationScores?.find(
						(ss: any) => ss.stationLayoutId === st.id && ss.presentationIndex === p
					);
					if (!score?.isComplete) return false;
				}
			}
		}
		return true;
	});

	/** Leaderboard rows matching watch page (live from cockpit state). */
	const cockpitStations = $derived(selectedEvent?.round?.stations ?? []);
	const cockpitLeaderboard = $derived.by(() => {
		if (!selectedEvent?.teams?.length || !cockpitStations.length) return [];
		const totalPossibleAll = cockpitStations.reduce(
			(sum: number, st: any) => sum + st.totalClays * 3,
			0
		);
		const rows = selectedEvent.teams.map((team: any) => {
			const scores: Record<number, number> = {};
			const presentationScores: Record<number, (number | null)[]> = {};
			let totalHit = 0;
			let perfectStands = 0;
			let perfectPresentations = 0;
			for (const st of cockpitStations) {
				const pres: (number | null)[] = [null, null, null];
				let standTotal = 0;
				for (let p = 1; p <= 3; p++) {
					const s = team.stationScores?.find(
						(ss: any) => ss.stationLayoutId === st.id && ss.presentationIndex === p
					);
					if (s?.isComplete) {
						pres[p - 1] = s.claysHit;
						standTotal += s.claysHit;
						if (s.claysHit === st.totalClays) perfectPresentations += 1;
					}
				}
				scores[st.stationIndex] = standTotal;
				presentationScores[st.stationIndex] = pres;
				totalHit += standTotal;
				if (standTotal === st.totalClays * 3 && pres.every((v) => v !== null)) {
					perfectStands += 1;
				}
			}
			const accuracy =
				totalPossibleAll > 0 ? Math.round((totalHit / totalPossibleAll) * 1000) / 10 : 0;
			return {
				id: team.id,
				teamName: team.teamName,
				shooter1: team.shooter1,
				shooter2: team.shooter2,
				scores,
				presentationScores,
				totalHit,
				totalPossible: totalPossibleAll,
				accuracy,
				perfectStands,
				perfectPresentations
			};
		});
		return rows.sort((a: any, b: any) => {
			if (b.totalHit !== a.totalHit) return b.totalHit - a.totalHit;
			if (b.perfectStands !== a.perfectStands) return b.perfectStands - a.perfectStands;
			if (b.perfectPresentations !== a.perfectPresentations)
				return b.perfectPresentations - a.perfectPresentations;
			return a.teamName.localeCompare(b.teamName);
		});
	});

	function isPerfectPres(hit: number | null | undefined, totalClays: number): boolean {
		return hit !== null && hit !== undefined && hit === totalClays;
	}

	/** Race math for the team currently being scored. */
	const activeTeamRace = $derived.by(() => {
		if (!activeTeam || !cockpitStations.length) {
			return null;
		}
		// Remaining clays available on incomplete presentations
		let pointsLeft = 0;
		let presentationsLeft = 0;
		for (const st of cockpitStations) {
			for (let p = 1; p <= 3; p++) {
				const s = activeTeam.stationScores?.find(
					(ss: any) => ss.stationLayoutId === st.id && ss.presentationIndex === p
				);
				if (!s?.isComplete) {
					pointsLeft += st.totalClays;
					presentationsLeft += 1;
				}
			}
		}

		const myHit = teamTotalHit;
		const others = (selectedEvent?.teams ?? []).filter((t: any) => t.id !== activeTeam.id);
		const otherTotals = others.map((t: any) =>
			(t.stationScores ?? []).reduce((sum: number, ss: any) => sum + (ss.claysHit || 0), 0)
		);
		const bestOther = otherTotals.length ? Math.max(...otherTotals) : 0;
		const isLeader = myHit > bestOther || otherTotals.length === 0;
		const isTiedForLead = myHit === bestOther && otherTotals.length > 0;
		const leaderHit = Math.max(myHit, bestOther);
		const behind = Math.max(0, leaderHit - myHit);
		const aheadBy = isLeader && !isTiedForLead ? myHit - bestOther : 0;
		const needToTie = behind; // 0 if leading or tied
		const needToPass = isLeader && !isTiedForLead ? 0 : behind + 1;
		const canTie = needToTie === 0 || pointsLeft >= needToTie;
		const canPass = needToPass === 0 || pointsLeft >= needToPass;
		const maxFinish = myHit + pointsLeft;

		return {
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
			maxFinish
		};
	});

	/** Winner + tie-break explanation for completed cockpit card. */
	const completeSummary = $derived.by(() => {
		const board = cockpitLeaderboard;
		if (!board.length) return null;
		const winner = board[0];
		const second = board[1] ?? null;
		if (!second) {
			return {
				winner,
				tied: false,
				tieBreak: null as string | null,
				margin: null as number | null
			};
		}
		const tiedOnScore = winner.totalHit === second.totalHit;
		let tieBreak: string | null = null;
		if (tiedOnScore) {
			if (winner.perfectStands !== second.perfectStands) {
				tieBreak = `Tie broken by perfect stands (${winner.perfectStands} vs ${second.perfectStands})`;
			} else if (winner.perfectPresentations !== second.perfectPresentations) {
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

	function navigateTimeline(direction: 'forward' | 'backward') {
		if (!selectedEvent) return;
		const N = totalTeams * totalStations * 3;
		if (N === 0) return;

		// Calculate current 1D index
		let i = activeStationIndex * (totalTeams * 3) + activeTeamIndex * 3 + activePresentationIndex;

		if (direction === 'forward') {
			i = (i + 1) % N;
		} else {
			i = (i - 1 + N) % N;
		}

		// Deconstruct back to individual 3D indexes
		activeStationIndex = Math.floor(i / (totalTeams * 3));
		activeTeamIndex = Math.floor((i % (totalTeams * 3)) / 3);
		activePresentationIndex = i % 3;

		// Update tempScoreInput so it highlights the scored value for this new presentation (if scored)
		const currentScore = activeTeam?.stationScores?.find((ss: any) => 
			ss.stationLayoutId === activeStation?.id && 
			ss.presentationIndex === activePresentationIndex + 1
		);
		tempScoreInput = (currentScore && currentScore.isComplete) ? currentScore.claysHit : null;
	}

	function selectDynamicEvent(event: any) {
		selectedEvent = event;
		activeTeamIndex = event.currentTeamIndex !== undefined ? event.currentTeamIndex : 0;
		activeStationIndex = event.currentStationIndex !== undefined ? event.currentStationIndex : 0;
		activePresentationIndex = event.currentPresentationIndex !== undefined ? event.currentPresentationIndex : 0;
		scoringError = '';
		tempScoreInput = null;
		headerExpanded = false; // mobile default: minimized sticky header
		// Completed events: setup permanently blocked for this session; scoring hidden until unlock
		allowEventSetup = event.eventState !== 'COMPLETE';
	}

	async function unlockEventForEdit() {
		if (!selectedEvent) return;
		const ok = confirm(
			'Unlock this completed event for score edits? Event Setup will stay locked. Re-finalize when done.'
		);
		if (!ok) return;
		isSaving = true;
		scoringError = '';
		try {
			const res = await fetch(`/api/complete/dynamic/${selectedEvent.id}/reopen`, { method: 'POST' });
			const result = await res.json().catch(() => ({}));
			if (!res.ok || !result.success) {
				scoringError = result.message || 'Failed to unlock event.';
				return;
			}
			selectedEvent.eventState = 'ACTIVE';
			allowEventSetup = false;
			// keep list data in sync when returning later
			const listed = data.dynamicEvents?.find((e: any) => e.id === selectedEvent.id);
			if (listed) listed.eventState = 'ACTIVE';
		} catch (err: any) {
			scoringError = err.message || 'Failed to unlock event.';
		} finally {
			isSaving = false;
		}
	}

	// Svelte 5 reactive sync: Keep database updated on who is currently shooting and on-deck in real-time
	$effect(() => {
		if (selectedEvent && activeStation && !isSaving) {
			fetch('/api/score/dynamic', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					stationLayoutId: activeStation.id,
					currentTeamIndex: activeTeamIndex,
					currentStationIndex: activeStationIndex,
					currentPresentationIndex: activePresentationIndex
				})
			}).catch(err => console.error("Real-time index sync failed:", err));
		}
	});

	async function submitScore(scoreValue: number) {
		if (!activeTeam || !activeStation) return;

		isSaving = true;
		scoringError = '';
		scoreUpdateSuccess = false;
		tempScoreInput = scoreValue;

		try {
			const res = await fetch('/api/score/dynamic', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					teamId: activeTeam.id,
					stationLayoutId: activeStation.id,
					presentationIndex: activePresentationIndex + 1, // 1, 2, or 3
					claysHit: scoreValue
				})
			});

			const result = await res.json();
			if (result.success) {
				scoreUpdateSuccess = true;

				// Update local state reactively
				const team = selectedEvent.teams.find((t: any) => t.id === activeTeam.id);
				if (team) {
					let score = team.stationScores.find((ss: any) => 
						ss.stationLayoutId === activeStation.id && 
						ss.presentationIndex === activePresentationIndex + 1
					);
					if (score) {
						score.claysHit = scoreValue;
						score.isComplete = true;
					} else {
						team.stationScores.push({
							stationLayoutId: activeStation.id,
							presentationIndex: activePresentationIndex + 1,
							claysHit: scoreValue,
							isComplete: true
						});
					}
				}

				// Automated Rotation Flow — do not advance past the final presentation
				const isLastPresentation =
					activeStationIndex === totalStations - 1 &&
					activeTeamIndex === totalTeams - 1 &&
					activePresentationIndex === 2;

				if (!isLastPresentation) {
					// 1. Increment presentation index (0 -> 1 -> 2)
					if (activePresentationIndex < 2) {
						activePresentationIndex++;
					} else {
						// 2. Once 3 presentations are complete, next TEAM at this stand
						activePresentationIndex = 0;
						if (activeTeamIndex < totalTeams - 1) {
							activeTeamIndex++;
						} else {
							// 3. All teams done at this stand → next STAND, Team 1
							activeTeamIndex = 0;
							if (activeStationIndex < totalStations - 1) {
								activeStationIndex++;
							}
						}
					}
					tempScoreInput = null;
				}
				// else: stay on final slot with score highlighted so finalize can show
			} else {
				scoringError = result.message || 'Failed to submit score.';
			}
		} catch (err: any) {
			scoringError = err.message || 'An error occurred while saving.';
		} finally {
			isSaving = false;
		}
	}

	function handleEventSetupRedirect() {
		if (!allowEventSetup || selectedEvent?.eventState === 'COMPLETE') {
			alert('Event Setup is not available for completed events.');
			return;
		}
		if (selectedEvent.eventState === 'ACTIVE') {
			const confirmSetup = confirm('Warning: Score-keeping has already started for this event! Going back to event setup will reset all current scoring data. Are you sure you want to proceed?');
			if (!confirmSetup) return;
		}
		goto(`/shootEvents/new-dynamic?edit=${selectedEvent.id}`);
	}

	async function finalizeEvent() {
		const confirmClose = confirm('Are you sure you want to finalize this dynamic event? This will mark the round complete.');
		if (!confirmClose) return;

		isSaving = true;
		try {
			const res = await fetch(`/api/complete/dynamic/${selectedEvent.id}`, { method: 'POST' });
			const result = await res.json().catch(() => ({}));
			if (!res.ok || !result.success) {
				scoringError = result.message || 'Failed to finalize event.';
				return;
			}
			selectedEvent = null;
			headerExpanded = false;
			await invalidateAll();
			await goto('/clays');
		} catch (err) {
			console.error('Failed to finalize event:', err);
			scoringError = 'Failed to finalize event.';
		} finally {
			isSaving = false;
		}
	}

	/** Active events first, then completed by createdAt newest → oldest. */
	const sortedDynamicEvents = $derived.by(() => {
		const list = [...(data.dynamicEvents ?? [])];
		const rank = (state: string) => (state === 'COMPLETE' ? 1 : 0);
		list.sort((a: any, b: any) => {
			const byState = rank(a.eventState) - rank(b.eventState);
			if (byState !== 0) return byState;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
		return list;
	});
</script>

<svelte:window bind:innerWidth={screenSize} />

<div class="container mx-auto max-w-5xl p-3 md:p-4 space-y-4 md:space-y-6 overflow-x-hidden w-full max-w-full">
	<!-- Tab Bar (hidden when actively scoring) -->
	{#if !selectedEvent}
		<div class="flex border-b border-zinc-200 dark:border-zinc-800">
			<button
				class="flex-1 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition {activeTab === 'dynamic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}"
				onclick={() => activeTab = 'dynamic'}
			>
				Team 5-Stand (Dynamic)
			</button>
			<button
				class="flex-1 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition {activeTab === 'legacy' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}"
				onclick={() => activeTab = 'legacy'}
			>
				Sporting Clays (Legacy)
			</button>
		</div>
	{/if}

	<!-- TAB 1: DYNAMIC COCKPIT -->
	{#if activeTab === 'dynamic'}
		{#if !selectedEvent}
			<!-- Selector view -->
			<div class="space-y-4">
				<div class="flex justify-between items-center gap-2">
					<h2 class="text-xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-zinc-50">Dynamic Events</h2>
					{#if isSignedIn}
						<a href="/shootEvents/new-dynamic" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition text-sm shrink-0">
							+ Create Dynamic Event
						</a>
					{/if}
				</div>

				{#if sortedDynamicEvents.length === 0}
					<div class="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10">
						<p class="text-zinc-500 dark:text-zinc-400">No Dynamic 5-Stand events found.</p>
						{#if isSignedIn}
							<p class="text-xs text-zinc-400 mt-1">Create one using the button above to start scoring.</p>
						{:else}
							<p class="text-xs text-zinc-400 mt-1">Sign in to create and score events.</p>
						{/if}
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4">
						{#each sortedDynamicEvents as de}
							{@const isComplete = de.eventState === 'COMPLETE'}
							{@const placeIcon = ['🏆', '🥈', '🥉']}
							<button
								type="button"
								class="p-5 text-left rounded-2xl border transition flex justify-between items-start gap-3 min-w-0
									{isComplete
										? 'border-emerald-300/80 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/25 hover:border-emerald-500 hover:shadow'
										: 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-indigo-500 hover:shadow'}"
								onclick={() => selectDynamicEvent(de)}
							>
								<div class="space-y-1 min-w-0 flex-1">
									<h3 class="font-extrabold uppercase tracking-wide truncate {isComplete ? 'text-emerald-900 dark:text-emerald-100' : 'text-zinc-900 dark:text-zinc-50'}">{de.eventName}</h3>
									<p class="text-xs text-zinc-400">Created: {de.createdAt ? new Date(de.createdAt).toDateString() : '—'}</p>
									<p class="text-xs font-semibold {isComplete ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}">
										{de.teams.length} Teams | {de.round?.stations.length || 0} Stands • Status: <span class="uppercase font-bold">{de.eventState}</span>
									</p>
									{#if isComplete && de.podium?.length}
										<ul class="mt-2 space-y-1.5">
											{#each de.podium as entry, i}
												<li class="min-w-0 {i === 0 ? 'text-emerald-800 dark:text-emerald-200' : 'text-emerald-800/85 dark:text-emerald-300/90'}">
													<div class="flex items-baseline justify-between gap-2">
														<span class="text-sm font-bold truncate">
															{placeIcon[i] ?? `${entry.place}.`}
															<span class="uppercase">{entry.place === 1 ? '1st' : entry.place === 2 ? '2nd' : '3rd'}: {entry.teamName}</span>
														</span>
														<span class="text-sm font-black shrink-0 tabular-nums">
															{entry.totalHit}<span class="text-[11px] font-semibold opacity-70">/{entry.maxPossible}</span>
														</span>
													</div>
													<p class="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400/80 pl-6 truncate">
														{entry.shooter1} • {entry.shooter2}
													</p>
												</li>
											{/each}
										</ul>
									{/if}
								</div>
								{#if !isComplete}
									<div class="flex flex-col items-end justify-center shrink-0">
										<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase">
											{isSignedIn ? 'Score Event' : 'View Event'}
										</span>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<!-- Score cockpit view -->
			<div class="space-y-3 md:space-y-6 overflow-x-hidden">
				{#snippet cockpitStandings()}
				<!-- Standings (always visible: active + complete) -->
				<div class="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-w-0">
					<div class="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/10">
						<h2 class="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
							{isEventComplete ? 'Final Standings' : 'Current Standings'}
						</h2>
						{#if isEventComplete}
							<span class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0">Final</span>
						{:else}
							<span class="text-xs text-zinc-500 flex items-center gap-1 shrink-0">
								<span class="h-2 w-2 bg-green-500 rounded-full"></span> Live
							</span>
						{/if}
					</div>

					<!-- Desktop table -->
					<div class="hidden md:block overflow-x-auto">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="text-xs font-bold uppercase text-zinc-400 bg-zinc-50/30 dark:bg-zinc-900/5 border-b border-zinc-100 dark:border-zinc-800">
									<th class="py-3 px-4">Rank</th>
									<th class="py-3 px-4">Team &amp; Shooters</th>
									{#each cockpitStations as station}
										<th class="py-3 px-3 text-center">Stand {station.stationIndex}</th>
									{/each}
									<th class="py-3 px-4 text-right">Total</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
								{#each cockpitLeaderboard as team, index}
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
											<p class="font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide text-sm">{team.teamName}</p>
											<p class="text-xs text-zinc-400 font-medium">{team.shooter1} • {team.shooter2}</p>
											<p class="text-[10px] text-zinc-400 mt-0.5 font-semibold">
												{team.accuracy}% acc · {team.perfectStands} perfect stands · {team.perfectPresentations} perfect pres
											</p>
										</td>
										{#each cockpitStations as station}
											<td class="py-3 px-3 text-center align-top">
												<span
													class="inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs {team.scores[station.stationIndex] === station.totalClays * 3
														? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
														: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'}"
												>
													{team.scores[station.stationIndex] ?? 0}
												</span>
												<p class="mt-1 text-[10px] font-bold tabular-nums tracking-tight" title="Presentations 1 · 2 · 3">
													{#each (team.presentationScores?.[station.stationIndex] ?? [null, null, null]) as hit, pi}
														{#if pi > 0}<span class="text-zinc-400 dark:text-zinc-600"> · </span>{/if}
														<span class={isPerfectPres(hit, station.totalClays) ? 'text-green-600 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}>
															{hit === null || hit === undefined ? '–' : hit}
														</span>
													{/each}
												</p>
											</td>
										{/each}
										<td class="py-3 px-4 text-right align-top">
											<span class="text-base font-black text-indigo-600 dark:text-indigo-400">{team.totalHit}</span>
											<span class="text-xs text-zinc-400"> / {team.totalPossible}</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Mobile cards -->
					<div class="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
						{#each cockpitLeaderboard as team, index}
							<div class="p-3 space-y-2.5">
								<div class="flex items-start justify-between gap-2">
									<div class="flex items-start gap-2 min-w-0">
										<span class="shrink-0 font-black w-7 text-center pt-0.5">
											{#if index === 0}🥇{:else if index === 1}🥈{:else if index === 2}🥉{:else}<span class="text-zinc-400 text-sm">#{index + 1}</span>{/if}
										</span>
										<div class="min-w-0">
											<p class="font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide text-sm break-words">{team.teamName}</p>
											<p class="text-xs text-zinc-400">{team.shooter1} • {team.shooter2}</p>
											<p class="text-[10px] text-zinc-400 font-semibold">
												{team.accuracy}% acc · {team.perfectStands} perfect stands · {team.perfectPresentations} perfect pres
											</p>
										</div>
									</div>
									<div class="text-right shrink-0">
										<span class="text-lg font-black text-indigo-600 dark:text-indigo-400">{team.totalHit}</span>
										<span class="text-xs text-zinc-400">/{team.totalPossible}</span>
									</div>
								</div>
								<div class="grid gap-1.5" style="grid-template-columns: repeat({Math.max(cockpitStations.length, 1)}, minmax(0, 1fr));">
									{#each cockpitStations as station}
										<div class="text-center space-y-1 min-w-0">
											<p class="text-[9px] font-bold uppercase text-zinc-400">S{station.stationIndex}</p>
											<span
												class="inline-flex items-center justify-center h-7 w-7 rounded-full font-bold text-[11px] {team.scores[station.stationIndex] === station.totalClays * 3
													? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
													: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'}"
											>
												{team.scores[station.stationIndex] ?? 0}
											</span>
											<p class="text-[9px] font-bold tabular-nums leading-tight">
												{#each (team.presentationScores?.[station.stationIndex] ?? [null, null, null]) as hit, pi}
													{#if pi > 0}<span class="text-zinc-400">·</span>{/if}
													<span class={isPerfectPres(hit, station.totalClays) ? 'text-green-600 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}>
														{hit === null || hit === undefined ? '–' : hit}
													</span>
												{/each}
											</p>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
				{/snippet}

				<!-- Cockpit Header: minimized icon row on mobile (expand on tap), full on md+ -->
				<div
					class="sticky top-0 z-30 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
				>
					{#if isMobile && !headerExpanded}
						<!-- Minimized single-row: icons only; tap card body to expand -->
						<div class="flex items-center justify-between gap-2 px-2 py-1.5">
							<button
								type="button"
								class="flex-1 min-w-0 text-left px-1 py-1"
								onclick={() => (headerExpanded = true)}
								aria-label="Expand active event details"
							>
								<span class="block text-[10px] font-bold uppercase tracking-wider truncate {isEventComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}">{isEventComplete ? 'Completed Event' : 'Active Shoot'}</span>
								<span class="block text-sm font-extrabold uppercase text-zinc-900 dark:text-zinc-50 truncate">{selectedEvent.eventName}</span>
							</button>
							<div class="flex items-center gap-1.5 shrink-0">
								{#if isSignedIn && allowEventSetup}
									<button
										type="button"
										class="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-base shadow"
										onclick={(e) => { e.stopPropagation(); handleEventSetupRedirect(); }}
										aria-label="Event Setup"
										title="Event Setup"
									>⚙️</button>
								{/if}
								{#if isSignedIn && isEventComplete}
									<button
										type="button"
										class="w-10 h-10 flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-base shadow"
										onclick={(e) => { e.stopPropagation(); unlockEventForEdit(); }}
										aria-label="Unlock and Edit"
										title="Unlock and Edit"
										disabled={isSaving}
									>🔓</button>
								{/if}
								<a
									href="/watchEvent/{selectedEvent.id}"
									target="_blank"
									class="w-10 h-10 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg text-base shadow-sm"
									aria-label="Watch Leaderboard"
									title="Watch Leaderboard"
									onclick={(e) => e.stopPropagation()}
								>📺</a>
								<button
									type="button"
									class="w-10 h-10 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-base font-bold"
									onclick={(e) => { e.stopPropagation(); selectedEvent = null; headerExpanded = false; }}
									aria-label="Switch Event"
									title="Switch Event"
								>←</button>
							</div>
						</div>
					{:else}
						<!-- Expanded (or desktop) -->
						<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 p-3 md:p-4">
							<button
								type="button"
								class="min-w-0 text-left md:cursor-default flex-1"
								onclick={() => { if (isMobile) headerExpanded = false; }}
								aria-label={isMobile ? 'Minimize active event details' : undefined}
							>
								<span class="text-xs font-bold uppercase tracking-wider block {isEventComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}">{isEventComplete ? 'Completed Shoot Event' : 'Active Shoot Event'}</span>
								<span class="text-base md:text-lg font-extrabold uppercase text-zinc-900 dark:text-zinc-50 truncate block">{selectedEvent.eventName}</span>
								{#if isMobile}
									<span class="text-[10px] text-zinc-400">Tap to minimize</span>
								{/if}
							</button>
							<div class="flex items-center gap-2 w-full md:w-auto flex-wrap" role="group">
								{#if isSignedIn && allowEventSetup}
									<button
										type="button"
										class="px-3 md:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition rounded-lg text-sm flex items-center gap-1.5 shadow"
										onclick={handleEventSetupRedirect}
									>
										⚙️ <span class="sm:inline">Event Setup</span>
									</button>
								{/if}
								{#if isSignedIn && isEventComplete}
									<button
										type="button"
										class="px-3 md:px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold transition rounded-lg text-sm flex items-center gap-1.5 shadow"
										onclick={unlockEventForEdit}
										disabled={isSaving}
									>
										🔓 Unlock &amp; Edit
									</button>
								{/if}
								<a
									href="/watchEvent/{selectedEvent.id}"
									target="_blank"
									class="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold transition rounded-lg text-sm flex items-center gap-1.5 shadow-sm"
								>
									📺 <span class="hidden sm:inline">Watch Leaderboard</span>
								</a>
								<button
									type="button"
									class="px-3 md:px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition rounded-lg text-sm"
									onclick={() => { selectedEvent = null; headerExpanded = false; }}
								>
									← <span class="hidden sm:inline">Switch Event</span>
								</button>
							</div>
						</div>
					{/if}
				</div>

				{#if scoringError}
					<div class="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold border border-red-200 dark:border-red-900/30">
						{scoringError}
					</div>
				{/if}

				{#if isEventComplete}
					<div class="rounded-2xl border border-emerald-300/60 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 sm:px-5 sm:py-4 space-y-2 text-center">
						<p class="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Event Complete</p>
						{#if completeSummary?.winner}
							{@const w = completeSummary.winner}
							<div class="space-y-0.5">
								<p class="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">🥇 Winner</p>
								<p class="text-base sm:text-lg font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-100">{w.teamName}</p>
								<p class="text-xs text-zinc-500">{w.shooter1} • {w.shooter2}</p>
								<p class="text-sm font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
									{w.totalHit}<span class="text-zinc-400 font-semibold">/{w.totalPossible}</span>
									<span class="mx-1.5 text-zinc-400">·</span>
									<span class="text-emerald-700 dark:text-emerald-400">{w.accuracy}%</span>
								</p>
								<p class="text-[11px] font-semibold text-zinc-500">
									{w.perfectStands} perfect stands · {w.perfectPresentations} perfect presentations
								</p>
							</div>
							{#if completeSummary.tied && completeSummary.tieBreak}
								<div class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left sm:text-center">
									<p class="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Tie-breaker</p>
									<p class="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-100 mt-0.5">{completeSummary.tieBreak}</p>
									{#if completeSummary.second}
										<p class="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
											2nd {completeSummary.second.teamName}: {completeSummary.second.totalHit}/{completeSummary.second.totalPossible}
											· {completeSummary.second.perfectStands} perfect stands
											· {completeSummary.second.perfectPresentations} perfect pres
										</p>
									{/if}
								</div>
							{:else if completeSummary.margin != null && completeSummary.margin > 0}
								<p class="text-xs font-semibold text-zinc-500">
									Won by <span class="tabular-nums text-zinc-800 dark:text-zinc-200">{completeSummary.margin}</span> over {completeSummary.second?.teamName}
								</p>
							{/if}
						{/if}
						<p class="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
							Scoring locked. Use the header to open the leaderboard or unlock scores.
						</p>
						<p class="text-[10px] text-zinc-400 font-medium">
							Rank order: total hits → perfect stands → perfect presentations
						</p>
					</div>
				{/if}

				{#if isEventComplete}
					{@render cockpitStandings()}
				{:else if !isSignedIn}
					<div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 px-4 py-3 text-center space-y-1">
						<p class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Sign in to record scores</p>
						<p class="text-xs text-zinc-500">You can still open the watch leaderboard from the header.</p>
					</div>
					{@render cockpitStandings()}
				{/if}

				<!-- Dashboard Layout Grid (hidden while complete/locked / signed out) -->
				{#if showScoringUI}
				<div class="grid grid-cols-1 gap-3 md:gap-6 items-start min-w-0">
					<!-- Score Selector Entry Matrix — primary mobile viewport content -->
					<div class="bg-white dark:bg-zinc-950 p-3 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2.5 md:space-y-4 shadow-sm min-w-0">
						<div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2 gap-2 min-w-0">
							<div class="min-w-0">
								<span class="text-xs font-bold uppercase text-zinc-400 block">Record Clays Hit</span>
								<h3 class="text-base md:text-lg font-black uppercase text-indigo-600 dark:text-indigo-400 truncate">{activeTeam?.teamName}</h3>
								<p class="text-[11px] text-zinc-500 font-medium truncate">{activeTeam?.shooter1} • {activeTeam?.shooter2}</p>
							</div>
							<div class="text-right shrink-0">
								<span class="text-xs font-semibold text-zinc-500 uppercase">Max: {activeStation?.totalClays}</span>
								<span class="text-xl md:text-2xl font-black block text-zinc-900 dark:text-zinc-50">#{activePresentationIndex + 1} / 3</span>
							</div>
						</div>

						<div class="grid grid-cols-5 gap-1.5 md:gap-2">
							{#each [0, 1, 2, 3, 4] as val}
								<button
									class="py-3 md:py-4 text-lg font-black rounded-xl border-2 transition {tempScoreInput === val ? 'bg-indigo-600 text-white border-indigo-600 scale-105' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50'} {val > (activeStation?.totalClays || 3) ? 'opacity-30 cursor-not-allowed text-zinc-300' : 'hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95'}"
									disabled={val > (activeStation?.totalClays || 3) || isSaving}
									onclick={() => submitScore(val)}
								>
									{val}
								</button>
							{/each}
						</div>

						<!-- Current Stand Presentations list -->
						<div class="border-t border-zinc-100 dark:border-zinc-800 pt-2 md:pt-3">
							<span class="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5 md:mb-2 text-center">Stand #{activeStation?.stationIndex} Presentations</span>
							<div class="flex items-center justify-center gap-2 md:gap-3">
								{#each [0, 1, 2] as presIdx}
									{@const scoreObj = activeTeam?.stationScores?.find((ss: any) => ss.stationLayoutId === activeStation?.id && ss.presentationIndex === presIdx + 1)}
									<button
										class="px-3 md:px-4 py-1.5 md:py-2 rounded-xl border flex flex-col items-center transition 
											{activePresentationIndex === presIdx ? 'border-indigo-600 bg-indigo-50/15 ring-2 ring-indigo-500/20' : 
											(scoreObj && scoreObj.isComplete && scoreObj.claysHit === activeStation.totalClays) ? 'border-green-500 bg-green-500/10' : 
											'border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10'} 
											hover:border-indigo-400"
										onclick={() => {
											activePresentationIndex = presIdx;
											tempScoreInput = (scoreObj && scoreObj.isComplete) ? scoreObj.claysHit : null;
										}}
									>
										<span class="text-[9px] uppercase tracking-wider font-bold {activePresentationIndex === presIdx ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}">Pres {presIdx + 1}</span>
										<span class="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
											{scoreObj && scoreObj.isComplete ? scoreObj.claysHit : '-'}
										</span>
									</button>
								{/each}
							</div>
						</div>

						<!-- Unified Timeline Navigator (Back and Next) -->
						<div class="flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-900/40 p-2 md:p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 min-w-0">
							<button
								class="px-2.5 md:px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 rounded-lg flex items-center gap-1 active:scale-95 transition shrink-0"
								onclick={() => navigateTimeline('backward')}
							>
								◀ Back
							</button>
							<div class="text-center min-w-0 flex-1">
								<span class="text-xs font-black uppercase text-zinc-900 dark:text-zinc-50 tracking-wider block truncate">
									{activeTeam?.teamName}
								</span>
								<span class="text-[10px] text-zinc-400 block">
									Stand {activeStationIndex + 1} • Presentation {activePresentationIndex + 1}
								</span>
							</div>
							<button
								class="px-2.5 md:px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 rounded-lg flex items-center gap-1 active:scale-95 transition shrink-0"
								onclick={() => navigateTimeline('forward')}
							>
								Next ▶
							</button>
						</div>

						<!-- Miniature Team Standings History Row -->
						<div class="border-t border-zinc-100 dark:border-zinc-800 pt-2 md:pt-3 mt-1 md:mt-3 min-w-0">
							<span class="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5 md:mb-2">Team Scoring History</span>
							<div class="grid grid-cols-7 gap-0.5 md:gap-1 text-center bg-zinc-50 dark:bg-zinc-900/50 p-1.5 md:p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 min-w-0 overflow-hidden">
								{#each teamStandTotals as stTotal}
									<div class="space-y-0.5 md:space-y-1 min-w-0">
										<span class="text-[8px] md:text-[9px] font-bold text-zinc-400 block truncate">S{stTotal.stationIndex}</span>
										<span class="inline-flex items-center justify-center h-5 w-5 md:h-6 md:w-6 rounded-full font-black text-[10px] md:text-[11px] {stTotal.hit === stTotal.max ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}">
											{stTotal.hit}
										</span>
									</div>
								{/each}
								{#if teamStandTotals.length < 6}
									{#each Array(6 - teamStandTotals.length) as _}
										<div></div>
									{/each}
								{/if}
								<div class="space-y-0.5 md:space-y-1 border-l border-zinc-200 dark:border-zinc-800 pl-1 md:pl-1.5 min-w-0">
									<span class="text-[8px] md:text-[9px] font-bold text-zinc-400 block">TOTAL</span>
									<span class="text-[10px] md:text-xs font-black text-indigo-600 dark:text-indigo-400 block leading-5 md:leading-6">
										{teamTotalHit}<span class="text-[9px] md:text-[10px] text-zinc-400 font-normal">/{teamTotalPossible}</span>
									</span>
								</div>
							</div>

							{#if activeTeamRace}
								{@const race = activeTeamRace}
								<div class="mt-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 p-2.5 sm:p-3 space-y-2 min-w-0">
									<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
										{#if race.isLeader && !race.isTiedForLead}
											<p class="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
												Leading by <span class="tabular-nums">{race.aheadBy}</span>
											</p>
										{:else if race.isTiedForLead}
											<p class="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400">
												Tied for lead
											</p>
										{:else}
											<p class="text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400">
												<span class="tabular-nums">{race.behind}</span> behind leader
												<span class="text-zinc-400 font-semibold">({race.leaderHit})</span>
											</p>
										{/if}
										<p class="text-[11px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-300">
											<span class="tabular-nums font-black text-zinc-900 dark:text-zinc-50">{race.pointsLeft}</span> pts left
											<span class="text-zinc-400">· {race.presentationsLeft} pres</span>
										</p>
									</div>
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] sm:text-[11px]">
										<div class="rounded-lg px-2 py-1.5 border {race.canTie ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' : 'border-zinc-300/60 dark:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500'}">
											{#if race.needToTie === 0}
												<span class="font-bold">Tie:</span> already at/above lead
											{:else}
												<span class="font-bold">Need {race.needToTie} to tie</span>
												<span class="opacity-80"> · {race.canTie ? 'possible' : 'not possible'}</span>
											{/if}
										</div>
										<div class="rounded-lg px-2 py-1.5 border {race.canPass ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300' : 'border-zinc-300/60 dark:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500'}">
											{#if race.needToPass === 0}
												<span class="font-bold">Pass:</span> sole lead locked if they hold
											{:else}
												<span class="font-bold">Need {race.needToPass} to pass</span>
												<span class="opacity-80"> · {race.canPass ? 'possible' : 'not possible'}</span>
											{/if}
										</div>
									</div>
									<p class="text-[10px] text-zinc-500 font-medium">
										Max finish <span class="tabular-nums font-bold text-zinc-700 dark:text-zinc-200">{race.maxFinish}</span>
										<span class="text-zinc-400"> (current {race.myHit} + {race.pointsLeft} left)</span>
									</p>
								</div>
							{/if}
						</div>

						<!-- Finalize only after last team/stand/presentation has a recorded score -->
						{#if canFinalizeEvent}
							<button
								class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black uppercase tracking-wide transition shadow"
								onclick={finalizeEvent}
								disabled={isSaving}
							>
								🏁 Complete & Finalize Event
							</button>
						{/if}
					</div>

					{@render cockpitStandings()}

					<!-- Visual Overlay Panel -->
					<div class="bg-white dark:bg-zinc-950 p-3 md:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 md:space-y-4 min-w-0">
						<div class="flex justify-between items-start gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 min-w-0">
							<div class="min-w-0">
								<span class="text-xs font-bold text-zinc-400 uppercase block">Active Presentation Menu</span>
								<h4 class="text-sm md:text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-50">Stand #{activeStation?.stationIndex}</h4>
							</div>
							<div class="text-right shrink-0 max-w-[55%]">
								<span class="text-[10px] md:text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded inline-block">
									{activeStation?.launchType.replace('_', ' ')}
								</span>
								<p class="text-[10px] md:text-xs font-bold text-zinc-500 mt-1 break-all">Sequence: {activeStation?.sequence}</p>
							</div>
						</div>

						<!-- Full menu image visible (contain, not cropped) -->
						<div class="relative w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
							<img
								src={blankMenu}
								alt="Active Stand layout"
								class="w-full h-auto max-h-[min(70vh,560px)] object-contain rounded-xl shadow-inner block mx-auto"
							/>
							<svg
								viewBox="0 0 100 100"
								preserveAspectRatio="xMidYMid meet"
								class="absolute inset-0 w-full h-full pointer-events-none select-none"
							>
								<!-- ... (SVG code) ... -->
							</svg>
						</div>
					</div>
				</div>
				{/if}
			</div>
		{/if}
	{:else}
		<!-- TAB 2: LEGACY EVENT ACCORDION (Backward Compatible) -->
		<div class="flex font-sans my-auto min-w-[390px]">
			<Accordion>
				{#each data.dbShootEvents as se}
					<AccordionItem>
						<svelte:fragment slot="lead">
							<a href="/watchEvent/{se.id}"><img class="h-8" src={clay} alt="capshield" /></a>
						</svelte:fragment>
						<svelte:fragment slot="summary">
							{new Date(se.createdAt).toDateString()} :
							{se.eventName} :
							{se.eventState}
						</svelte:fragment>
						<svelte:fragment slot="content">
							{#each se.eventTeamScores as ets}
								{#if screenSize > 1368}
									<a href="/shootEvents/{se.id}">
										<TeamData teamData={ets} orientation="horizontal"/>
									</a>
								{:else}
									<a href="/shootEvents/{se.id}">
										<TeamData teamData={ets} orientation="vertical"/>
									</a>
								{/if}
							{/each}
						</svelte:fragment>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>

		<div class="flex my-auto min-w-[390px] pt-6">
			<img class="flex-1 mx-auto min-w-[390px] max-w-[690px]" src={doglaugh} alt="duck hunt dog" />
		</div>
		<LegendCompact/>
	{/if}
</div>
