<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';

	// Svelte 5 props
	let { data } = $props<{ data: { shootEvents: any[] } }>();

	let deletingId = $state<number | null>(null);
	let deletingName = $state<string>('');
	let confirmInput = $state<string>('');
	let isDeleting = $state<boolean>(false);
	let errorMessage = $state<string>('');

	function openDeleteModal(id: number, name: string) {
		deletingId = id;
		deletingName = name;
		confirmInput = '';
		errorMessage = '';
	}

	function closeDeleteModal() {
		deletingId = null;
		deletingName = '';
		confirmInput = '';
		errorMessage = '';
	}

	async function handleDelete() {
		if (!deletingId) return;
		if (confirmInput.toLowerCase() !== 'delete') {
			errorMessage = 'Please type "delete" to confirm.';
			return;
		}

		isDeleting = true;
		errorMessage = '';

		try {
			const res = await fetch(`/api/admin/shootEvents/${deletingId}`, {
				method: 'DELETE'
			});
			const result = await res.json();

			if (result.success) {
				await invalidateAll();
				closeDeleteModal();
			} else {
				errorMessage = result.message || 'Failed to delete event.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'An error occurred during deletion.';
		} finally {
			isDeleting = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Freedom Party</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-8 max-w-5xl">
	<!-- Admin Header -->
	<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-surface-500/20 pb-6">
		<div>
			<h1 class="h1 text-primary-500 font-bold uppercase tracking-wider">Admin Dashboard</h1>
			<p class="text-surface-600 dark:text-surface-300">Manage database state and purge old shooting events safely.</p>
		</div>

		<form method="POST" action="/admin/login?/logout" use:enhance>
			<button type="submit" class="btn variant-filled-surface hover:variant-filled-warning font-semibold">
				Sign Out
			</button>
		</form>
	</div>

	<!-- Main Card / Table -->
	<div class="card p-6 shadow-xl variant-glass-surface space-y-6">
		<h2 class="h3 font-bold uppercase tracking-wide">All Shoot Events</h2>

		{#if data.shootEvents.length === 0}
			<div class="text-center py-12 text-surface-600 dark:text-surface-400">
				No shoot events found in the database.
			</div>
		{:else}
			<div class="table-container">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>ID</th>
							<th>Event Name</th>
							<th>Status</th>
							<th>Teams</th>
							<th>Rounds</th>
							<th>Created At</th>
							<th class="text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each data.shootEvents as event}
							<tr>
								<td>{event.id}</td>
								<td class="font-bold">{event.eventName}</td>
								<td>
									<span class="chip {event.eventState === 'COMPLETE' ? 'variant-filled-success' : 'variant-filled-primary'}">
										{event.eventState}
									</span>
								</td>
								<td>{event.teamsCount} teams</td>
								<td>{event.roundsCount} rounds</td>
								<td class="text-xs text-surface-600 dark:text-surface-400">
									{new Date(event.createdAt).toLocaleString()}
								</td>
								<td class="text-right">
									<button
										class="btn btn-sm variant-filled-error hover:scale-105 transition-transform"
										onclick={() => openDeleteModal(event.id, event.eventName)}
									>
										Purge Event
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Safe Deletion Confirmation Modal -->
{#if deletingId !== null}
	<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
		<div class="card p-6 max-w-md w-full variant-glass-surface shadow-2xl space-y-4 border border-error-500/30">
			<header class="space-y-2">
				<h3 class="h3 text-error-500 font-bold uppercase">Confirm Event Purge</h3>
				<p class="text-sm text-surface-600 dark:text-surface-300">
					You are about to permanently delete <strong class="text-error-500">{deletingName}</strong> (ID: {deletingId}).
				</p>
			</header>

			<div class="alert variant-filled-warning p-4 rounded text-sm space-y-1">
				<p class="font-bold">⚠️ Warning:</p>
				<p>This will cascade-delete all related teams, rounds, station layouts, and scores. This action cannot be undone.</p>
			</div>

			<div class="space-y-3">
				<label class="label">
					<span class="text-sm">Type <strong class="uppercase text-error-500">delete</strong> below to confirm:</span>
					<input
						class="input p-2 rounded"
						type="text"
						bind:value={confirmInput}
						placeholder="delete"
						disabled={isDeleting}
					/>
				</label>

				{#if errorMessage}
					<p class="text-error-500 text-sm text-center font-semibold">{errorMessage}</p>
				{/if}
			</div>

			<footer class="flex justify-end gap-3 pt-2">
				<button
					class="btn variant-soft"
					onclick={closeDeleteModal}
					disabled={isDeleting}
				>
					Cancel
				</button>
				<button
					class="btn variant-filled-error"
					onclick={handleDelete}
					disabled={isDeleting || confirmInput.toLowerCase() !== 'delete'}
				>
					{#if isDeleting}
						Purging...
					{:else}
						Permanently Purge
					{/if}
				</button>
			</footer>
		</div>
	</div>
{/if}
