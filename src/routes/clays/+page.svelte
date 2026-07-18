<script lang="ts">
	import LegendCompact from '$lib/components/LegendCompact.svelte';
	import TeamData from '$lib/components/TeamData.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import doglaugh from '$lib/images/doglaugh.gif';
	import clay from '$lib/images/capshield.svg';
	import type { PageData } from './$types';

	// Images for active dynamic visual displays
	import blankMenu from '$lib/images/blank_menu.png';
	import station1 from '$lib/images/station_1.png';
	import station2 from '$lib/images/station_2.png';
	import station3 from '$lib/images/station_3.png';
	import station4 from '$lib/images/station_4.png';
	import station5 from '$lib/images/station_5.png';
	import station6 from '$lib/images/station_6.png';

	// Svelte 5 props
	let { data } = $props<{ data: PageData }>();

	let screenSize = $state<number>(1024);

	// Tabs: 'dynamic' or 'legacy'
	let activeTab = $state<'dynamic' | 'legacy'>('dynamic');

	// Active Dynamic Event & Scoring state
	let selectedEvent = $state<any | null>(null);
	let activeTeamIndex = $state<number>(0);
	let activeStationIndex = $state<number>(0);
	let isSaving = $state<boolean>(false);
	let scoringError = $state<string>('');
	let scoreUpdateSuccess = $state<boolean>(false);

	// Score log
	let tempScoreInput = $state<number | null>(null);

	// Map station index to visual image overlays
	const stationImages: Record<number, string> = {
		1: station1,
		2: station2,
		3: station3,
		4: station4,
		5: station5,
		6: station6
	};

	// Derived states using runes
	const activeTeam = $derived(selectedEvent ? selectedEvent.teams[activeTeamIndex] : null);
	const activeStation = $derived(selectedEvent?.round ? selectedEvent.round.stations[activeStationIndex] : null);
	const totalStations = $derived(selectedEvent?.round ? selectedEvent.round.stations.length : 0);
	const totalTeams = $derived(selectedEvent ? selectedEvent.teams.length : 0);

	function selectDynamicEvent(event: any) {
		selectedEvent = event;
		activeTeamIndex = event.currentTeamIndex !== undefined ? event.currentTeamIndex : 0;
		activeStationIndex = event.currentStationIndex !== undefined ? event.currentStationIndex : 0;
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
					currentStationIndex: activeStationIndex
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
					claysHit: scoreValue
				})
			});

			const result = await res.json();
			if (result.success) {
				scoreUpdateSuccess = true;
				// Auto-advance logic: move to next station, or wrap to next team
				if (activeStationIndex < totalStations - 1) {
					activeStationIndex++;
				} else {
					// End of stations for this team, wrap to next team Stand 1
					activeStationIndex = 0;
					if (activeTeamIndex < totalTeams - 1) {
						activeTeamIndex++;
					} else {
						// All teams complete all stations
						activeTeamIndex = 0;
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
</script>

<svelte:window bind:innerWidth={screenSize} />

<div class="container mx-auto max-w-5xl p-4 space-y-6">
	<!-- Tab Bar -->
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
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each data.dynamicEvents as de}
							<button
								class="p-5 text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:shadow bg-white dark:bg-zinc-950 transition flex justify-between items-center"
								onclick={() => selectDynamicEvent(de)}
							>
								<div class="space-y-1">
									<h3 class="font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">{de.eventName}</h3>
									<p class="text-xs text-zinc-400">Created: {new Date().toDateString()}</p>
									<p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{de.teams.length} Teams | {de.round?.stations.length || 0} Stands</p>
								</div>
								<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase">
									Score Event
								</span>
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
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
					<!-- Active Team Panel -->
					<div class="space-y-4">
						<div class="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl space-y-4">
							<div>
								<span class="text-xs font-bold uppercase tracking-widest text-indigo-200">Active Shooting Team</span>
								<h3 class="text-2xl font-extrabold uppercase">{activeTeam?.teamName}</h3>
							</div>
							<div class="grid grid-cols-2 gap-4 border-t border-indigo-500 pt-3">
								<div>
									<span class="text-xs text-indigo-200">Shooter 1</span>
									<p class="font-bold text-sm">{activeTeam?.shooter1}</p>
								</div>
								<div>
									<span class="text-xs text-indigo-200">Shooter 2</span>
									<p class="font-bold text-sm">{activeTeam?.shooter2}</p>
								</div>
							</div>
						</div>

						<!-- Score Selector Entry Matrix -->
						<div class="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
							<div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
								<span class="text-xs font-bold uppercase text-zinc-400">Record Team Clays Hit</span>
								<span class="text-xs font-semibold text-zinc-500">Max Score: {activeStation?.totalClays}</span>
							</div>

							<div class="grid grid-cols-5 gap-2">
								{#each [0, 1, 2, 3, 4] as val}
									<button
										class="py-4 text-lg font-black rounded-xl border-2 transition {val > (activeStation?.totalClays || 3) ? 'opacity-30 cursor-not-allowed bg-zinc-100 dark:bg-zinc-900 border-transparent text-zinc-300' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95'}"
										disabled={val > (activeStation?.totalClays || 3) || isSaving}
										onclick={() => submitScore(val)}
									>
										{val}
									</button>
								{/each}
							</div>

							<!-- Tactical navigation adjusters -->
							<div class="grid grid-cols-2 gap-2 pt-2">
								<div class="space-y-1">
									<span class="text-[10px] uppercase font-bold text-zinc-400 block text-center">Roster Selector</span>
									<div class="flex items-center gap-1 justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
										<button
											class="p-1 font-bold text-xs text-zinc-500 hover:text-zinc-900"
											onclick={() => { if (activeTeamIndex > 0) activeTeamIndex--; }}
											disabled={activeTeamIndex === 0}
										>
											◀
										</button>
										<span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">
											Team {activeTeamIndex + 1}/{totalTeams}
										</span>
										<button
											class="p-1 font-bold text-xs text-zinc-500 hover:text-zinc-900"
											onclick={() => { if (activeTeamIndex < totalTeams - 1) activeTeamIndex++; }}
											disabled={activeTeamIndex === totalTeams - 1}
										>
											▶
										</button>
									</div>
								</div>
								<div class="space-y-1">
									<span class="text-[10px] uppercase font-bold text-zinc-400 block text-center">Stand Selector</span>
									<div class="flex items-center gap-1 justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
										<button
											class="p-1 font-bold text-xs text-zinc-500 hover:text-zinc-900"
											onclick={() => { if (activeStationIndex > 0) activeStationIndex--; }}
											disabled={activeStationIndex === 0}
										>
											◀
										</button>
										<span class="text-xs font-bold text-zinc-700 dark:text-zinc-300">
											Stand {activeStationIndex + 1}/{totalStations}
										</span>
										<button
											class="p-1 font-bold text-xs text-zinc-500 hover:text-zinc-900"
											onclick={() => { if (activeStationIndex < totalStations - 1) activeStationIndex++; }}
											disabled={activeStationIndex === totalStations - 1}
										>
											▶
										</button>
									</div>
								</div>
							</div>
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
								src={stationImages[activeStation?.stationIndex || 1] || blankMenu}
								alt="Active Stand layout"
								class="w-full object-cover rounded-xl shadow-inner max-h-[380px]"
							/>
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
