<script lang="ts">
	import LegendCompact from '$lib/components/LegendCompact.svelte';
	import TeamData from '$lib/components/TeamData.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import doglaugh from '$lib/images/doglaugh.gif';
	import clay from '$lib/images/capshield.svg';
	import { goto } from '$app/navigation';
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
				
				// Automated Rotation Flow:
				// 1. Increment presentation index (0 -> 1 -> 2)
				if (activePresentationIndex < 2) {
					activePresentationIndex++;
				} else {
					// 2. Once 3 presentations are complete, wrap back to presentation 1 and move to the next TEAM at this stand
					activePresentationIndex = 0;
					if (activeTeamIndex < totalTeams - 1) {
						activeTeamIndex++;
					} else {
						// 3. Once all teams have completed all 3 presentations at this stand, wrap back to Team 1 and advance to the next STAND
						activeTeamIndex = 0;
						if (activeStationIndex < totalStations - 1) {
							activeStationIndex++;
						} else {
							// 4. All stations fully complete!
							activeStationIndex = 0;
						}
					}
				}
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
			// Update state to COMPLETE
			const res = await fetch('/api/score/dynamic', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					stationLayoutId: activeStation.id,
					currentTeamIndex: activeTeamIndex,
					currentStationIndex: activeStationIndex
				})
			});
			// Complete event in DB
			await fetch(`/api/complete/${selectedEvent.id}/completeEvent`);
			selectedEvent = null;
			goto('/clays');
		} catch (err) {
			console.error("Failed to finalize event:", err);
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:window bind:innerWidth={screenSize} />

<div class="container mx-auto max-w-5xl p-4 space-y-6">
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
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-extrabold uppercase tracking-wider text-zinc-950 dark:text-zinc-50">Active Dynamic Events</h2>
					<a href="/shootEvents/new-dynamic" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition text-sm">
						+ Create Dynamic Event
					</a>
				</div>

				{#if !data.dynamicEvents || data.dynamicEvents.length === 0}
					<div class="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10">
						<p class="text-zinc-500 dark:text-zinc-400">No active Dynamic 5-Stand events found.</p>
						<p class="text-xs text-zinc-400 mt-1">Create one using the button above to start scoring.</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4">
						{#each data.dynamicEvents as de}
							<button
								class="p-5 text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:shadow bg-white dark:bg-zinc-950 transition flex justify-between items-center"
								onclick={() => selectDynamicEvent(de)}
							>
								<div class="space-y-1">
									<h3 class="font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">{de.eventName}</h3>
									<p class="text-xs text-zinc-400">Created: {new Date().toDateString()}</p>
									<p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{de.teams.length} Teams | {de.round?.stations.length || 0} Stands • Status: <span class="uppercase font-bold">{de.eventState}</span></p>
								</div>
								{#if de.eventState === 'COMPLETE'}
									<span class="px-3 py-1 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase">
										Complete
									</span>
								{:else}
									<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase">
										Score Event
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<!-- Score cockpit view -->
			<div class="space-y-6">
				<!-- Cockpit Header -->
				<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
					<div>
						<span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Active Shoot Event</span>
						<h2 class="text-lg font-extrabold uppercase text-zinc-900 dark:text-zinc-50">{selectedEvent.eventName}</h2>
					</div>
					<div class="flex items-center gap-2">
						<button
							class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition rounded-lg text-sm flex items-center gap-1.5 shadow"
							onclick={handleEventSetupRedirect}
						>
							⚙️ Event Setup
						</button>
						<a
							href="/watchEvent/{selectedEvent.id}"
							target="_blank"
							class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold transition rounded-lg text-sm flex items-center gap-1.5 shadow-sm"
						>
							📺 Watch Leaderboard
						</a>
						<button
							class="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 transition rounded-lg text-sm"
							onclick={() => selectedEvent = null}
						>
							← Switch Event
						</button>
					</div>
				</div>

				{#if scoringError}
					<div class="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold border border-red-200 dark:border-red-900/30">
						{scoringError}
					</div>
				{/if}

				<!-- Dashboard Layout Grid -->
				<div class="grid grid-cols-1 gap-6 items-start">
					<!-- Score Selector Entry Matrix -->
					<div class="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
						<div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
							<div>
								<span class="text-xs font-bold uppercase text-zinc-400 block">Record Clays Hit</span>
								<h3 class="text-lg font-black uppercase text-indigo-600 dark:text-indigo-400">{activeTeam?.teamName}</h3>
								<p class="text-[11px] text-zinc-500 font-medium">{activeTeam?.shooter1} • {activeTeam?.shooter2}</p>
							</div>
							<div class="text-right">
								<span class="text-xs font-semibold text-zinc-500 uppercase">Max: {activeStation?.totalClays}</span>
								<span class="text-2xl font-black block text-zinc-900 dark:text-zinc-50">#{activePresentationIndex + 1} / 3</span>
							</div>
						</div>

						<div class="grid grid-cols-5 gap-2">
							{#each [0, 1, 2, 3, 4] as val}
								<button
									class="py-4 text-lg font-black rounded-xl border-2 transition {tempScoreInput === val ? 'bg-indigo-600 text-white border-indigo-600 scale-105' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50'} {val > (activeStation?.totalClays || 3) ? 'opacity-30 cursor-not-allowed text-zinc-300' : 'hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95'}"
									disabled={val > (activeStation?.totalClays || 3) || isSaving}
									onclick={() => submitScore(val)}
								>
									{val}
								</button>
							{/each}
						</div>

							<!-- Current Stand Presentations list -->
							<div class="border-t border-zinc-100 dark:border-zinc-800 pt-3">
								<span class="text-[10px] font-bold uppercase text-zinc-400 block mb-2 text-center">Stand #{activeStation?.stationIndex} Presentations</span>
								<div class="flex items-center justify-center gap-3">
									{#each [0, 1, 2] as presIdx}
										{@const scoreObj = activeTeam?.stationScores?.find((ss: any) => ss.stationLayoutId === activeStation?.id && ss.presentationIndex === presIdx + 1)}
										<button
											class="px-4 py-2 rounded-xl border flex flex-col items-center transition {activePresentationIndex === presIdx ? 'border-indigo-600 bg-indigo-50/15 ring-2 ring-indigo-500/20' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10'} hover:border-indigo-400"
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
							<div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
								<button
									class="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 rounded-lg flex items-center gap-1 active:scale-95 transition"
									onclick={() => navigateTimeline('backward')}
								>
									◀ Back
								</button>
								<div class="text-center">
									<span class="text-xs font-black uppercase text-zinc-900 dark:text-zinc-50 tracking-wider">
										{activeTeam?.teamName}
									</span>
									<span class="text-[10px] text-zinc-400 block">
										Stand {activeStationIndex + 1} • Presentation {activePresentationIndex + 1}
									</span>
								</div>
								<button
									class="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 rounded-lg flex items-center gap-1 active:scale-95 transition"
									onclick={() => navigateTimeline('forward')}
								>
									Next ▶
								</button>
							</div>

							<!-- Miniature Team Standings History Row inside scoring card -->
							<div class="border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-3">
								<span class="text-[10px] font-bold uppercase text-zinc-400 block mb-2">Team Scoring History</span>
								<div class="grid grid-cols-7 gap-1 text-center bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
									{#each teamStandTotals as stTotal}
										<div class="space-y-1">
											<span class="text-[9px] font-bold text-zinc-400 block">STAND {stTotal.stationIndex}</span>
											<span class="inline-flex items-center justify-center h-6 w-6 rounded-full font-black text-[11px] {stTotal.hit === stTotal.max ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}">
												{stTotal.hit}
											</span>
										</div>
									{/each}
									{#if teamStandTotals.length < 6}
										{#each Array(6 - teamStandTotals.length) as _}
											<div></div>
										{/each}
									{/if}
									<div class="space-y-1 border-l border-zinc-200 dark:border-zinc-800 pl-1.5">
										<span class="text-[9px] font-bold text-zinc-400 block">TOTAL</span>
										<span class="text-xs font-black text-indigo-600 dark:text-indigo-400 block leading-6">
											{teamTotalHit} <span class="text-[10px] text-zinc-400 font-normal">/ {teamTotalPossible}</span>
										</span>
									</div>
								</div>
							</div>

							<!-- Finalize button at the bottom of panel -->
							{#if activeStationIndex === totalStations - 1 && activeTeamIndex === totalTeams - 1 && activePresentationIndex === 2}
								<button
									class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black uppercase tracking-wide transition shadow"
									onclick={finalizeEvent}
									disabled={isSaving}
								>
									🏁 Complete & Finalize Event
								</button>
							{/if}
						</div>
					</div>

					<!-- Visual Overlay Panel -->
					<div class="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
						<div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
							<div>
								<span class="text-xs font-bold text-zinc-400 uppercase block">Active Presentation Menu</span>
								<h4 class="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-50">Stand #{activeStation?.stationIndex}</h4>
							</div>
							<div class="text-right">
								<span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">
									{activeStation?.launchType.replace('_', ' ')}
								</span>
								<p class="text-xs font-bold text-zinc-500 mt-1">Sequence: {activeStation?.sequence}</p>
							</div>
						</div>

						<!-- Overlay graphic dynamically changing -->
						<div class="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
							<img
								src={blankMenu}
								alt="Active Stand layout"
								class="w-full object-cover rounded-xl shadow-inner max-h-[380px]"
							/>
							<svg
								viewBox="0 0 100 100"
								class="absolute inset-0 w-full h-full pointer-events-none select-none"
							>
								<defs>
									<marker
										id="arrow-red"
										viewBox="0 0 10 10"
										refX="6"
										refY="5"
										markerWidth="5"
										markerHeight="5"
										orient="auto-start-reverse"
									>
										<path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#EF4444" />
									</marker>
									<marker
										id="arrow-blue"
										viewBox="0 0 10 10"
										refX="6"
										refY="5"
										markerWidth="5"
										markerHeight="5"
										orient="auto-start-reverse"
									>
										<path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#3B82F6" />
									</marker>
									<marker
										id="arrow-amber"
										viewBox="0 0 10 10"
										refX="6"
										refY="5"
										markerWidth="5"
										markerHeight="5"
										orient="auto-start-reverse"
									>
										<path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#F59E0B" />
									</marker>
									<marker
										id="arrow-emerald"
										viewBox="0 0 10 10"
										refX="6"
										refY="5"
										markerWidth="5"
										markerHeight="5"
										orient="auto-start-reverse"
									>
										<path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10B981" />
									</marker>
								</defs>

								<!-- Checkmark on Active Launch Type Checkbox -->
								{#if activeStation && launchTypeCheckboxes[activeStation.launchType]}
									{@const coords = launchTypeCheckboxes[activeStation.launchType]}
									<circle cx={coords.x} cy={coords.y} r="2.2" fill="#10B981" class="animate-ping opacity-75" />
									<circle cx={coords.x} cy={coords.y} r="1.6" fill="#10B981" stroke="#fff" stroke-width="0.3" />
									<text x={coords.x} y={coords.y + 0.6} font-size="2" font-weight="extrabold" fill="#fff" text-anchor="middle">✓</text>
								{/if}

								<!-- Dynamic Flight Paths & Release Order badges -->
								{#if activeStation}
									{@const trapsInSequence = activeStation.sequence.replace(/[^1-5]/g, '').split('').map(Number)}
									{#each trapsInSequence as trap, index}
										{#if trapCoordinates[trap]}
											{@const start = trapCoordinates[trap]}
											{@const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981']}
											{@const arrowIds = ['arrow-red', 'arrow-blue', 'arrow-amber', 'arrow-emerald']}
											{@const color = colors[index % colors.length]}
											{@const arrowId = arrowIds[index % arrowIds.length]}
											
											<!-- Control point for curve (making paths bow out elegantly based on side) -->
											{@const midX = (start.x + shooterStand.x) / 2 + (start.x < 50 ? -8 : 8) * (1 - (index * 0.15))}
											{@const midY = (start.y + shooterStand.y) / 2 - 12 * (1 + (index * 0.1))}

											<!-- Path stroke curve -->
											<path
												d="M {start.x} {start.y} Q {midX} {midY} {shooterStand.x} {shooterStand.y}"
												fill="none"
												stroke={color}
												stroke-width="0.9"
												stroke-dasharray="1.5 0.7"
												marker-end="url(#{arrowId})"
											/>

											<!-- Release order badge positioned at curve midpoint -->
											{@const badgeX = (start.x + 2 * midX + shooterStand.x) / 4}
											{@const badgeY = (start.y + 2 * midY + shooterStand.y) / 4}
											<circle cx={badgeX} cy={badgeY} r="1.8" fill={color} stroke="#fff" stroke-width="0.25" />
											<text x={badgeX} y={badgeY + 0.6} font-size="1.8" font-weight="black" fill="#fff" text-anchor="middle">{index + 1}</text>
										{/if}
									{/each}
								{/if}
							</svg>
						</div>
					</div>
				</div>
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
