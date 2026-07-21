<script lang="ts">
	import { goto } from '$app/navigation';
	import blankMenu from '$lib/images/blank_menu.png';
	import terminology from '$lib/images/terminology.png';

	// Props using Svelte 5 runes
	let { data } = $props<{ data: { user: any; editEvent: any } }>();

	// Stepper state
	let currentStep = $state<number>(1);

	// Event Configuration state (supports edit mode prepopulating)
	let eventName = $state<string>('');
	
	// Teams state (supports edit mode prepopulating)
	let teams = $state<Array<{ teamName: string; shooter1: string; shooter2: string }>>([
		{ teamName: 'Stars and Stripes', shooter1: 'Shooter A', shooter2: 'Shooter B' }
	]);

	// Stations state (supports edit mode prepopulating)
	let stations = $state<Array<{ stationIndex: number; launchType: string; sequence: string }>>([
		{ stationIndex: 1, launchType: 'REPORT_TRIPLE', sequence: '132' },
		{ stationIndex: 2, launchType: 'REPORT_TRIPLE', sequence: '524' },
		{ stationIndex: 3, launchType: 'TRIPLE_1_PLUS_2', sequence: '245' },
		{ stationIndex: 4, launchType: 'TRIPLE_2_PLUS_1', sequence: '134' },
		{ stationIndex: 5, launchType: 'QUAD_2_PLUS_2', sequence: '1235' }
	]);

	$effect(() => {
		if (data.editEvent) {
			eventName = data.editEvent.eventName || '';
			if (data.editEvent.teams) {
				teams = data.editEvent.teams;
			}
			if (data.editEvent.stations) {
				stations = data.editEvent.stations;
			}
		}
	});

	let errorMessage = $state<string>('');
	let isSubmitting = $state<boolean>(false);

	// Live derived analytics: clay inventory requirements
	const clayInventory = $derived.by(() => {
		const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		let totalClays = 0;

		stations.forEach(st => {
			const digits = st.sequence.replace(/[^1-5]/g, '').split('').map(Number);
			const claysPerPresentation = st.launchType === 'QUAD_2_PLUS_2' ? 4 : 3;
			
			// 3 presentations per team
			const multiplier = 3 * teams.length;

			digits.forEach(digit => {
				if (counts[digit] !== undefined) {
					counts[digit] += multiplier;
				}
			});

			totalClays += claysPerPresentation * multiplier;
		});

		return { counts, totalClays };
	});

	// Helpers
	function addTeam() {
		teams.push({
			teamName: getRandomTeamName(),
			shooter1: `Player ${teams.length * 2 + 1}`,
			shooter2: `Player ${teams.length * 2 + 2}`
		});
	}

	function removeTeam(index: number) {
		if (teams.length > 1) {
			teams.splice(index, 1);
		}
	}

	function randomizeTeamOrder() {
		teams = [...teams].sort(() => Math.random() - 0.5);
	}

	function addStation() {
		const nextIdx = stations.length + 1;
		stations.push({
			stationIndex: nextIdx,
			launchType: 'REPORT_TRIPLE',
			sequence: '132'
		});
	}

	function removeStation(index: number) {
		if (stations.length > 1) {
			stations.splice(index, 1);
			stations.forEach((st, idx) => {
				st.stationIndex = idx + 1;
			});
		}
	}

	function randomizeTraps() {
		const launchTypes = ['REPORT_TRIPLE', 'TRIPLE_1_PLUS_2', 'TRIPLE_2_PLUS_1', 'QUAD_2_PLUS_2'];
		stations.forEach(st => {
			st.launchType = launchTypes[Math.floor(Math.random() * launchTypes.length)];
			const numClays = st.launchType === 'QUAD_2_PLUS_2' ? 4 : 3;
			let seq = '';
			for (let i = 0; i < numClays; i++) {
				seq += Math.floor(Math.random() * 5 + 1);
			}
			st.sequence = seq;
		});
	}

	function getRandomTeamName() {
		const teamNames = [
			"Stars and Stripes", "Liberty Legends", "Freedom Fighters", "American Eagles",
			"Patriots United", "Liberty Warriors", "Independence Icons", "Bravehearts",
			"Founding Forces", "Liberty Leaders", "Honor Guard", "American Dream Team"
		];
		// Filter out names that are already taken
		const existingNames = teams.map(t => t.teamName.toLowerCase().trim());
		const availableNames = teamNames.filter(name => !existingNames.includes(name.toLowerCase().trim()));

		if (availableNames.length > 0) {
			return availableNames[Math.floor(Math.random() * availableNames.length)];
		}

		// Fallback if all standard names are taken
		return `Squad ${String.fromCharCode(65 + (teams.length % 26))}`;
	}

	async function handleSubmit() {
		if (!eventName.trim()) {
			errorMessage = 'Event name is required.';
			currentStep = 1;
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		const isEditMode = !!data.editEvent;
		const url = '/api/shootEvents/dynamic';
		const method = isEditMode ? 'PUT' : 'POST';
		const payload = isEditMode 
			? { eventId: data.editEvent.id, eventName, teams, stations }
			: { eventName, teams, stations };

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const result = await res.json();
			if (result.success) {
				// Navigate directly to the scoring cockpit with the active event!
				goto(`/clays`);
			} else {
				errorMessage = result.message || 'Failed to save dynamic event.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'An unexpected error occurred.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Create Dynamic Event - Freedom Party</title>
</svelte:head>

<div class="container mx-auto max-w-4xl p-6 space-y-8">
	<!-- Header -->
	<div class="border-b border-zinc-200 dark:border-zinc-800 pb-4">
		<h1 class="text-3xl font-extrabold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
			Create Dynamic Event
		</h1>
		<p class="text-zinc-500 dark:text-zinc-400 mt-1">Configure your Team 5-Stand dynamic event layout, rosters, and launch sequences.</p>
	</div>

	<!-- Step Navigation Indicators -->
	<div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
		{#each [1, 2, 3] as step}
			<button
				class="flex items-center gap-3 font-semibold transition-all"
				onclick={() => { if (step < currentStep || eventName) currentStep = step; }}
			>
				<span class="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 {currentStep === step ? 'bg-indigo-600 text-white border-indigo-600' : 'text-zinc-400 border-zinc-300 dark:border-zinc-700'}">
					{step}
				</span>
				<span class="hidden sm:inline text-sm uppercase tracking-wider {currentStep === step ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400'}">
					{step === 1 ? 'Details' : step === 2 ? 'Teams' : 'Station Menus'}
				</span>
			</button>
			{#if step < 3}
				<div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-4"></div>
			{/if}
		{/each}
	</div>

	{#if errorMessage}
		<div class="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold border border-red-200 dark:border-red-900/30">
			{errorMessage}
		</div>
	{/if}

	<!-- STEP 1: EVENT DETAILS -->
	{#if currentStep === 1}
		<div class="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
			<h2 class="text-xl font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step 1: Event Details</h2>
			<div class="space-y-2">
				<label class="block text-sm font-bold text-zinc-700 dark:text-zinc-300" for="eventName">Event Name</label>
				<input
					id="eventName"
					type="text"
					class="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-indigo-500"
					placeholder="Independence Day Shootout 2025"
					bind:value={eventName}
				/>
			</div>
			<div class="flex justify-end pt-4">
				<button
					class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
					onclick={() => { if (eventName.trim()) currentStep = 2; else errorMessage = 'Event name is required.'; }}
				>
					Next: Configure Teams
				</button>
			</div>
		</div>
	{/if}

	<!-- STEP 2: CONFIGURE ROSTERS -->
	{#if currentStep === 2}
		<div class="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
			<div class="flex justify-between items-center">
				<h2 class="text-xl font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step 2: Team Rosters</h2>
				<div class="flex gap-2">
					<button
						class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg font-bold transition text-sm"
						onclick={randomizeTeamOrder}
					>
						🎲 Randomize Order
					</button>
					<button
						class="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 rounded-lg font-bold hover:bg-indigo-100 transition text-sm"
						onclick={addTeam}
					>
						+ Add Team
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each teams as team, index}
					<div class="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 relative bg-zinc-50/50 dark:bg-zinc-900/20">
						{#if teams.length > 1}
							<button
								class="absolute top-2 right-2 text-zinc-400 hover:text-red-500 text-sm font-bold transition"
								onclick={() => removeTeam(index)}
							>
								Remove
							</button>
						{/if}
						<div class="space-y-1">
							<span class="text-xs font-bold text-zinc-400 uppercase">Team #{index + 1}</span>
							<input
								type="text"
								class="w-full p-2 text-sm font-bold bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-indigo-500 outline-none text-zinc-900 dark:text-zinc-50"
								bind:value={team.teamName}
								placeholder="Team Name"
							/>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<div class="space-y-1">
								<span class="text-xs font-medium text-zinc-500">Shooter 1</span>
								<input
									type="text"
									class="w-full p-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-transparent text-zinc-900 dark:text-zinc-50"
									bind:value={team.shooter1}
									placeholder="Name"
								/>
							</div>
							<div class="space-y-1">
								<span class="text-xs font-medium text-zinc-500">Shooter 2</span>
								<input
									type="text"
									class="w-full p-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-transparent text-zinc-900 dark:text-zinc-50"
									bind:value={team.shooter2}
									placeholder="Name"
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="flex justify-between pt-4">
				<button
					class="px-5 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-bold hover:bg-zinc-100 transition"
					onclick={() => currentStep = 1}
				>
					Back
				</button>
				<button
					class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
					onclick={() => currentStep = 3}
				>
					Next: Configure Station Menus
				</button>
			</div>
		</div>
	{/if}

	<!-- STEP 3: CONFIGURE STATION MENUS -->
	{#if currentStep === 3}
		<div class="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
			<div>
				<h2 class="text-xl font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step 3: Station Launch Menus</h2>
				<p class="text-sm text-zinc-500 dark:text-zinc-400">
					Each station uses the Team 5-Stand layout. Configure the launch logic type and active trap release sequences.
				</p>
			</div>

			<!-- Menu graphic references side-by-side -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
				<div class="space-y-2 text-center min-w-0">
					<h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400">Layout Menu Map</h3>
					<img src={blankMenu} alt="Blank Stand Menu Map" class="w-full h-auto object-contain rounded-lg shadow border border-zinc-200 dark:border-zinc-800" />
				</div>
				<div class="space-y-2 text-center min-w-0">
					<h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400">Launch Terminology Reference</h3>
					<img src={terminology} alt="Presentation Terminology Guide" class="w-full h-auto object-contain rounded-lg shadow border border-zinc-200 dark:border-zinc-800" />
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
				<div class="lg:col-span-3">
					<p class="text-xs text-zinc-500 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-3 rounded-lg">
						💡 <strong>Simplified Release Input Format:</strong> Just type the numbers directly (e.g., <code>132</code> for Trap 1 then Trap 3 then Trap 2). For a 2+1 Triple, <code>553</code> is perfect (simultaneous pair on Trap 5, then Trap 3 on report). For a Quad, enter 4 digits such as <code>1235</code>.
					</p>
				</div>

				<!-- Station layout selectors (taking 3 columns space below references) -->
				<div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each stations as station}
						<div class="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/30 dark:bg-zinc-900/10">
							<div class="flex justify-between items-center">
								<span class="text-sm font-bold text-zinc-900 dark:text-zinc-50">Stand / Station #{station.stationIndex}</span>
								<div class="flex items-center gap-2">
									<span class="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">
										{station.launchType === 'QUAD_2_PLUS_2' ? '12 Clays' : '9 Clays'}
									</span>
									{#if stations.length > 1}
										<button
											class="text-xs text-red-500 hover:text-red-700 font-bold"
											onclick={() => removeStation(station.stationIndex - 1)}
										>
											Remove
										</button>
									{/if}
								</div>
							</div>

							<div class="grid grid-cols-2 gap-3">
								<div class="space-y-1">
									<span class="text-xs text-zinc-500">Launch Type</span>
									<select
										class="w-full p-2 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50"
										bind:value={station.launchType}
									>
										<option value="REPORT_TRIPLE">Report Triple</option>
										<option value="TRIPLE_1_PLUS_2">1+2 Triple</option>
										<option value="TRIPLE_2_PLUS_1">2+1 Triple</option>
										<option value="QUAD_2_PLUS_2">2+2 Quad</option>
									</select>
								</div>
								<div class="space-y-1">
									<span class="text-xs text-zinc-500">Trap Sequence (Digits)</span>
									<input
										type="text"
										class="w-full p-2 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50"
										bind:value={station.sequence}
										placeholder="e.g. 132 or 553"
									/>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex flex-col sm:flex-row gap-2 sm:justify-end">
				<button
					class="flex-1 sm:flex-none px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg font-bold transition text-sm"
					onclick={randomizeTraps}
				>
					🎲 Randomize Traps
				</button>
				<button
					class="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 rounded-lg font-bold hover:bg-indigo-100 transition text-sm"
					onclick={addStation}
				>
					+ Add Stand
				</button>
			</div>

			<!-- Live Analytics & Clay Inventory Tool -->
			<div class="p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-4 shadow">
				<div class="flex justify-between items-center border-b border-zinc-800 pb-2">
					<h3 class="text-xs font-bold uppercase tracking-widest text-indigo-400">📊 Clay Inventory Analytics Tool (Dynamic Event)</h3>
					<span class="text-xs font-black text-indigo-300">Total Event Clays Required: {clayInventory.totalClays}</span>
				</div>
				<div class="grid grid-cols-5 gap-3 text-center">
					{#each [1, 2, 3, 4, 5] as trap}
						<div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
							<span class="text-[10px] text-zinc-500 font-bold uppercase">Trap #{trap}</span>
							<p class="text-lg font-black text-indigo-400">{clayInventory.counts[trap]}</p>
							<span class="text-[9px] text-zinc-600 block">clays required</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
				<button
					class="px-5 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-bold hover:bg-zinc-100 transition"
					onclick={() => currentStep = 2}
					disabled={isSubmitting}
				>
					Back
				</button>
				<button
					class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center gap-2"
					onclick={handleSubmit}
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						Creating Event...
					{:else}
						Launch Dynamic Event 🚀
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>
