<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { prismaSlide } from '$lib/shared/utils';
	import DataTable from '$lib/components/DataTable.svelte';
	import { enhance } from '$app/forms';

	// Svelte 5 props
	let { data, form } = $props<{ data: { isAdmin: boolean }; form: any }>();

	let inputName = $state('');
	let inputSpeed = $state<number | null>(null);
	let interval: number;
	let slides = $state<prismaSlide[] | null>(null);

	async function fetchData(): Promise<void> {
		try {
			const response = await fetch('/api/slides');
			if (!response.ok) {
				throw new Error(`Error fetching data: ${response.statusText}`);
			}
			slides = await response.json();
		} catch (error) {
			console.error(error);
		}
	}

	onMount(() => {
		fetchData();
		interval = window.setInterval(fetchData, 5000); // Poll every 5 seconds for live scoreboard feel
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Slip & Slide Speeds - Freedom Party</title>
</svelte:head>

<div class="container mx-auto px-3 sm:px-4 py-4 max-w-4xl space-y-8 my-4 sm:my-6 overflow-x-hidden">
	<!-- Header Section -->
	<header class="text-center space-y-2">
		<h1 class="h2 sm:h1 text-primary-500 font-extrabold uppercase tracking-widest">
			🌊 Slip & Slide Speeds 🌊
		</h1>
		<p class="text-surface-600 dark:text-surface-300 max-w-xl mx-auto text-sm sm:text-base">
			Official radar clockings for the annual Freedom celebration slide. Speed matches faith—let it fly!
		</p>
	</header>

	<!-- Admin Control Panel (Protected) -->
	{#if data.isAdmin}
		<div class="card p-6 shadow-xl variant-glass-surface border border-primary-500/30 max-w-xl mx-auto space-y-4">
			<header class="border-b border-zinc-200/50 dark:border-zinc-800 pb-2">
				<h3 class="h3 font-bold text-primary-500 uppercase tracking-wide flex items-center gap-2">
					⚡ Admin Radar Entry
				</h3>
				<p class="text-xs text-surface-600 dark:text-surface-400">
					Clock a new slider speed into the database
				</p>
			</header>

			<form method="POST" action="?/submitSpeed" use:enhance={() => {
				return async ({ update, result }) => {
					await update();
					if (result.type === 'success') {
						// Reset only speed on success to make repeated entry for the same slide easier
						inputSpeed = null;
						fetchData();
					}
				};
			}} class="space-y-4">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<label class="label">
						<span class="font-semibold text-xs uppercase tracking-wider text-surface-600 dark:text-surface-300">Slider Name</span>
						<input
							class="input p-3 rounded"
							type="text"
							name="slider"
							placeholder="e.g. Justin"
							required
							bind:value={inputName}
						/>
					</label>

					<label class="label">
						<span class="font-semibold text-xs uppercase tracking-wider text-surface-600 dark:text-surface-300">Speed (FPS)</span>
						<input
							class="input p-3 rounded"
							type="number"
							name="speed"
							placeholder="e.g. 33"
							required
							min="1"
							bind:value={inputSpeed}
						/>
					</label>
				</div>

				{#if form?.message}
					<div class="alert {form.success ? 'variant-filled-success' : 'variant-filled-error'} p-3 rounded text-sm text-center">
						{form.message}
					</div>
				{/if}

				<button
					type="submit"
					class="btn variant-filled-primary w-full py-3 font-bold uppercase tracking-wide shadow hover:scale-[1.01] transition-transform"
				>
					Log Speed Run
				</button>
			</form>
		</div>
	{/if}

	<!-- Leaderboard Table Section (Visible to All) -->
	<div class="space-y-4">
		<h3 class="h3 font-extrabold uppercase tracking-wider text-center text-secondary-500">
			🏆 Speed Leaderboard
		</h3>

		{#if slides}
			<div class="card p-3 sm:p-6 shadow-xl variant-glass-surface max-w-3xl mx-auto w-full min-w-0 overflow-hidden">
				<DataTable myData={slides} />
			</div>
		{:else}
			<div class="text-center py-12 text-surface-500 dark:text-surface-400 animate-pulse">
				Loading live radar runs...
			</div>
		{/if}
	</div>
</div>
