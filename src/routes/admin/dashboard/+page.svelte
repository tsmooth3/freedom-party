<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { data } = $props<{
		data: {
			legacyEvents: any[];
			dynamicEvents: any[];
			users: any[];
			currentUserId: number | null;
		};
	}>();

	type Tab = 'users' | 'dynamic' | 'legacy';
	let activeTab = $state<Tab>('users');

	// Shared event purge modal
	type EventKind = 'legacy' | 'dynamic';
	let purgeKind = $state<EventKind | null>(null);
	let purgeId = $state<number | null>(null);
	let purgeName = $state('');
	let confirmInput = $state('');
	let isWorking = $state(false);
	let errorMessage = $state('');

	// User role change
	let roleBusyId = $state<number | null>(null);

	// Dynamic event scorers editor
	let scorersEventId = $state<number | null>(null);
	let scorersEventName = $state('');
	let scorersCreatorId = $state<number | null>(null);
	let scorerDraftIds = $state<number[]>([]);
	let scorerPickerId = $state('');
	let scorersBusy = $state(false);

	// User delete modal
	let deleteUserId = $state<number | null>(null);
	let deleteUserName = $state('');
	let deleteUserEvents = $state(0);
	let reassignToUserId = $state<string>('null');
	let userConfirmInput = $state('');

	const ROLES = ['SPECTATOR', 'SCORER', 'ADMIN'] as const;

	const adminCount = $derived(data.users.filter((u) => u.role === 'ADMIN').length);

	const reassignOptions = $derived(data.users.filter((u) => u.id !== deleteUserId));

	function userLabel(u: { name?: string | null; email?: string } | null | undefined) {
		if (!u) return 'Unknown';
		return (u.name && u.name.trim()) || u.email || 'Unknown';
	}

	function openScorersEditor(event: {
		id: number;
		eventName: string;
		creator: { id: number } | null;
		scorers: { id: number }[];
	}) {
		scorersEventId = event.id;
		scorersEventName = event.eventName;
		scorersCreatorId = event.creator?.id ?? null;
		scorerDraftIds = (event.scorers ?? []).map((s) => s.id);
		scorerPickerId = '';
		errorMessage = '';
	}

	function closeScorersEditor() {
		scorersEventId = null;
		scorersEventName = '';
		scorersCreatorId = null;
		scorerDraftIds = [];
		scorerPickerId = '';
	}

	function addAdminScorerDraft() {
		const id = Number(scorerPickerId);
		if (!Number.isFinite(id) || id <= 0) return;
		if (scorersCreatorId !== null && id === scorersCreatorId) return;
		if (!scorerDraftIds.includes(id)) scorerDraftIds = [...scorerDraftIds, id];
		scorerPickerId = '';
	}

	function removeAdminScorerDraft(id: number) {
		scorerDraftIds = scorerDraftIds.filter((x) => x !== id);
	}

	async function saveAdminScorers() {
		if (!scorersEventId) return;
		scorersBusy = true;
		errorMessage = '';
		try {
			const res = await fetch(`/api/shootEvents/dynamic/${scorersEventId}/scorers`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userIds: scorerDraftIds })
			});
			const result = await res.json();
			if (result.success) {
				await invalidateAll();
				closeScorersEditor();
			} else {
				errorMessage = result.message || 'Failed to update scorers.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'An error occurred updating scorers.';
		} finally {
			scorersBusy = false;
		}
	}

	const adminEligibleScorers = $derived.by(() => {
		return data.users.filter(
			(u) => u.id !== scorersCreatorId && !scorerDraftIds.includes(u.id)
		);
	});

	function openEventPurge(kind: EventKind, id: number, name: string) {
		purgeKind = kind;
		purgeId = id;
		purgeName = name;
		confirmInput = '';
		errorMessage = '';
	}

	function closeEventPurge() {
		purgeKind = null;
		purgeId = null;
		purgeName = '';
		confirmInput = '';
		errorMessage = '';
	}

	async function handleEventPurge() {
		if (!purgeId || !purgeKind) return;
		if (confirmInput.toLowerCase() !== 'delete') {
			errorMessage = 'Please type "delete" to confirm.';
			return;
		}

		isWorking = true;
		errorMessage = '';
		try {
			const path =
				purgeKind === 'legacy'
					? `/api/admin/shootEvents/${purgeId}`
					: `/api/admin/dynamicEvents/${purgeId}`;
			const res = await fetch(path, { method: 'DELETE' });
			const result = await res.json();
			if (result.success) {
				await invalidateAll();
				closeEventPurge();
			} else {
				errorMessage = result.message || 'Failed to delete event.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'An error occurred during deletion.';
		} finally {
			isWorking = false;
		}
	}

	async function changeRole(userId: number, role: string) {
		if (data.currentUserId !== null && userId === data.currentUserId) {
			errorMessage = 'You cannot change your own role.';
			return;
		}
		roleBusyId = userId;
		errorMessage = '';
		try {
			const res = await fetch(`/api/admin/users/${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role })
			});
			const result = await res.json();
			if (result.success) {
				await invalidateAll();
			} else {
				errorMessage = result.message || 'Failed to update role.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'An error occurred updating role.';
		} finally {
			roleBusyId = null;
		}
	}

	function openUserDelete(user: {
		id: number;
		name: string | null;
		email: string;
		eventsCreated: number;
		role: string;
	}) {
		if (data.currentUserId !== null && user.id === data.currentUserId) {
			errorMessage = 'You cannot delete your own account.';
			return;
		}
		if (user.role === 'ADMIN' && adminCount <= 1) {
			errorMessage = 'Cannot delete the last remaining ADMIN.';
			return;
		}
		deleteUserId = user.id;
		deleteUserName = user.name || user.email;
		deleteUserEvents = user.eventsCreated;
		reassignToUserId = 'null';
		userConfirmInput = '';
		errorMessage = '';
	}

	function closeUserDelete() {
		deleteUserId = null;
		deleteUserName = '';
		deleteUserEvents = 0;
		reassignToUserId = 'null';
		userConfirmInput = '';
		errorMessage = '';
	}

	async function handleUserDelete() {
		if (!deleteUserId) return;
		if (userConfirmInput.toLowerCase() !== 'delete') {
			errorMessage = 'Please type "delete" to confirm.';
			return;
		}

		isWorking = true;
		errorMessage = '';
		try {
			const payload = {
				reassignToUserId: reassignToUserId === 'null' ? null : Number(reassignToUserId)
			};
			const res = await fetch(`/api/admin/users/${deleteUserId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = await res.json();
			if (result.success) {
				await invalidateAll();
				closeUserDelete();
			} else {
				errorMessage = result.message || 'Failed to delete user.';
			}
		} catch (err: any) {
			errorMessage = err.message || 'An error occurred during deletion.';
		} finally {
			isWorking = false;
		}
	}

	function creatorLabel(creator: { name: string | null; email: string } | null) {
		if (!creator) return '—';
		return creator.name || creator.email;
	}

	function isSelf(userId: number) {
		return data.currentUserId !== null && userId === data.currentUserId;
	}

	function isLastAdmin(user: { id: number; role: string }) {
		return user.role === 'ADMIN' && adminCount <= 1;
	}

	function stateChip(state: string) {
		if (state === 'COMPLETE') return 'bg-emerald-600 text-white';
		if (state === 'ACTIVE') return 'bg-indigo-600 text-white';
		return 'bg-zinc-600 text-white';
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Freedom Party</title>
</svelte:head>

<div class="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 overflow-x-hidden">
	<header class="space-y-1 pb-4 border-b border-zinc-200/40 dark:border-zinc-800">
		<h1 class="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-indigo-500">
			Admin Dashboard
		</h1>
		<p class="text-sm text-zinc-500 dark:text-zinc-400">Manage events, users, and roles.</p>
	</header>

	{#if errorMessage && purgeId === null && deleteUserId === null}
		<div
			class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold flex justify-between gap-2 items-start"
		>
			<span class="min-w-0 break-words">{errorMessage}</span>
			<button type="button" class="shrink-0 underline text-xs" onclick={() => (errorMessage = '')}
				>dismiss</button
			>
		</div>
	{/if}

	<!-- Tabs: equal-width, wrap labels, no page overflow -->
	<div
		class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800"
		role="tablist"
	>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'users'}
			class="rounded-lg px-1.5 py-2.5 text-[11px] sm:text-sm font-bold uppercase tracking-wide transition text-center leading-tight
				{activeTab === 'users'
				? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm'
				: 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}"
			onclick={() => (activeTab = 'users')}
		>
			Users
			<span class="block sm:inline sm:ml-1 opacity-70 font-semibold normal-case"
				>({data.users.length})</span
			>
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'dynamic'}
			class="rounded-lg px-1.5 py-2.5 text-[11px] sm:text-sm font-bold uppercase tracking-wide transition text-center leading-tight
				{activeTab === 'dynamic'
				? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm'
				: 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}"
			onclick={() => (activeTab = 'dynamic')}
		>
			Dynamic
			<span class="block sm:inline sm:ml-1 opacity-70 font-semibold normal-case"
				>({data.dynamicEvents.length})</span
			>
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'legacy'}
			class="rounded-lg px-1.5 py-2.5 text-[11px] sm:text-sm font-bold uppercase tracking-wide transition text-center leading-tight
				{activeTab === 'legacy'
				? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm'
				: 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}"
			onclick={() => (activeTab = 'legacy')}
		>
			Legacy
			<span class="block sm:inline sm:ml-1 opacity-70 font-semibold normal-case"
				>({data.legacyEvents.length})</span
			>
		</button>
	</div>

	<!-- LEGACY: card list -->
	{#if activeTab === 'legacy'}
		<section class="space-y-3">
			<h2 class="text-sm font-extrabold uppercase tracking-wider text-zinc-500">Legacy Shoot Events</h2>
			{#if data.legacyEvents.length === 0}
				<div
					class="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500"
				>
					No legacy shoot events found.
				</div>
			{:else}
				<ul class="space-y-3">
					{#each data.legacyEvents as event}
						<li
							class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 p-4 space-y-3"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
										ID {event.id}
									</p>
									<h3 class="font-extrabold text-zinc-900 dark:text-zinc-50 break-words">
										{event.eventName}
									</h3>
								</div>
								<span
									class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full {stateChip(
										event.eventState
									)}"
								>
									{event.eventState}
								</span>
							</div>
							<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
								<span><strong class="text-zinc-700 dark:text-zinc-300">{event.teamsCount}</strong> teams</span>
								<span><strong class="text-zinc-700 dark:text-zinc-300">{event.roundsCount}</strong> rounds</span>
								<span class="w-full sm:w-auto">{new Date(event.createdAt).toLocaleString()}</span>
							</div>
							<button
								type="button"
								class="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition"
								onclick={() => openEventPurge('legacy', event.id, event.eventName)}
							>
								Purge Event
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}

	<!-- DYNAMIC: card list -->
	{#if activeTab === 'dynamic'}
		<section class="space-y-3">
			<h2 class="text-sm font-extrabold uppercase tracking-wider text-zinc-500">Dynamic Shoot Events</h2>
			{#if data.dynamicEvents.length === 0}
				<div
					class="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500"
				>
					No dynamic events found.
				</div>
			{:else}
				<ul class="space-y-3">
					{#each data.dynamicEvents as event}
						<li
							class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 p-4 space-y-3"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
										ID {event.id}
									</p>
									<h3 class="font-extrabold text-zinc-900 dark:text-zinc-50 break-words">
										{event.eventName}
									</h3>
								</div>
								<span
									class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full {stateChip(
										event.eventState
									)}"
								>
									{event.eventState}
								</span>
							</div>
							<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
								<span><strong class="text-zinc-700 dark:text-zinc-300">{event.teamsCount}</strong> teams</span>
								<span><strong class="text-zinc-700 dark:text-zinc-300">{event.standsCount}</strong> stands</span>
								<span class="w-full break-words">
									Creator:
									<strong class="text-zinc-700 dark:text-zinc-300">{creatorLabel(event.creator)}</strong>
									{#if event.creator}
										<span class="text-zinc-400"> · {event.creator.email}</span>
									{/if}
								</span>
								<span class="w-full break-words">
									Scorers:
									{#if event.scorers?.length}
										<strong class="text-zinc-700 dark:text-zinc-300">
											{event.scorers.map((s: any) => userLabel(s)).join(', ')}
										</strong>
									{:else}
										<span class="text-zinc-400 italic">creator &amp; admins only</span>
									{/if}
								</span>
								<span class="w-full sm:w-auto">{new Date(event.createdAt).toLocaleString()}</span>
							</div>
							<div class="flex flex-wrap gap-2">
								<button
									type="button"
									class="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition"
									onclick={() => openScorersEditor(event)}
								>
									Edit Scorers
								</button>
								<button
									type="button"
									class="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition"
									onclick={() => openEventPurge('dynamic', event.id, event.eventName)}
								>
									Purge Event
								</button>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}

	<!-- USERS: card list -->
	{#if activeTab === 'users'}
		<section class="space-y-3">
			<h2 class="text-sm font-extrabold uppercase tracking-wider text-zinc-500">Users & Roles</h2>
			{#if data.users.length === 0}
				<div
					class="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500"
				>
					No users found.
				</div>
			{:else}
				<ul class="space-y-3">
					{#each data.users as user}
						<li
							class="rounded-2xl border p-4 space-y-3
								{isSelf(user.id)
								? 'border-indigo-400/50 bg-indigo-500/5'
								: 'border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60'}"
						>
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0">
									<p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
										ID {user.id}
										{#if isSelf(user.id)}
											· <span class="text-indigo-500">you</span>
										{/if}
									</p>
									<h3 class="font-extrabold text-zinc-900 dark:text-zinc-50 break-words">
										{user.name || '—'}
									</h3>
									<p class="text-xs text-zinc-500 break-all">{user.email}</p>
								</div>
								<span
									class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
								>
									{user.role}
								</span>
							</div>

							<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
								<span
									><strong class="text-zinc-700 dark:text-zinc-300">{user.eventsCreated}</strong> events
									created</span
								>
								<span>{new Date(user.createdAt).toLocaleString()}</span>
							</div>

							<div class="flex flex-col sm:flex-row gap-2">
								<label class="flex-1 min-w-0 space-y-1">
									<span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400"
										>Role</span
									>
									<select
										class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-semibold"
										value={user.role}
										disabled={roleBusyId === user.id || isSelf(user.id) || isLastAdmin(user)}
										onchange={(e) => {
											const next = (e.currentTarget as HTMLSelectElement).value;
											if (next !== user.role) changeRole(user.id, next);
										}}
									>
										{#each ROLES as r}
											<option value={r}>{r}</option>
										{/each}
									</select>
								</label>
								<div class="flex flex-col justify-end">
									<button
										type="button"
										class="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition"
										disabled={isSelf(user.id) || isLastAdmin(user)}
										onclick={() => openUserDelete(user)}
									>
										Delete User
									</button>
								</div>
							</div>
						</li>
					{/each}
				</ul>
				<p class="text-xs text-zinc-500 leading-relaxed">
					Role changes apply immediately in the database. Google-signed-in users may need to sign
					out/in for their session to pick up a new role.
				</p>
			{/if}
		</section>
	{/if}
</div>

<!-- Event purge modal -->
{#if purgeId !== null}
	<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
		<div
			class="card p-5 sm:p-6 w-full sm:max-w-md variant-glass-surface shadow-2xl space-y-4 border border-error-500/30 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
		>
			<header class="space-y-2">
				<h3 class="text-lg font-bold uppercase text-error-500">Confirm Event Purge</h3>
				<p class="text-sm text-zinc-600 dark:text-zinc-300 break-words">
					Permanently delete <strong class="text-error-500">{purgeName}</strong>
					({purgeKind} · ID: {purgeId}).
				</p>
			</header>

			<div class="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-sm space-y-1">
				<p class="font-bold">Warning</p>
				<p class="text-zinc-700 dark:text-zinc-300">
					Hard-deletes the event and related teams, rounds, stations, and scores. Cannot be undone.
				</p>
			</div>

			<label class="block space-y-1">
				<span class="text-sm"
					>Type <strong class="uppercase text-error-500">delete</strong> to confirm:</span
				>
				<input
					class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
					type="text"
					bind:value={confirmInput}
					placeholder="delete"
					disabled={isWorking}
				/>
			</label>

			{#if errorMessage}
				<p class="text-error-500 text-sm text-center font-semibold break-words">{errorMessage}</p>
			{/if}

			<footer class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
				<button
					type="button"
					class="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold"
					onclick={closeEventPurge}
					disabled={isWorking}>Cancel</button
				>
				<button
					type="button"
					class="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold"
					onclick={handleEventPurge}
					disabled={isWorking || confirmInput.toLowerCase() !== 'delete'}
				>
					{isWorking ? 'Purging…' : 'Permanently Purge'}
				</button>
			</footer>
		</div>
	</div>
{/if}

<!-- User delete modal -->
{#if deleteUserId !== null}
	<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
		<div
			class="card p-5 sm:p-6 w-full sm:max-w-md variant-glass-surface shadow-2xl space-y-4 border border-error-500/30 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
		>
			<header class="space-y-2">
				<h3 class="text-lg font-bold uppercase text-error-500">Delete User</h3>
				<p class="text-sm text-zinc-600 dark:text-zinc-300 break-words">
					Permanently delete <strong class="text-error-500">{deleteUserName}</strong> (ID: {deleteUserId}).
				</p>
			</header>

			<div class="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-sm space-y-2">
				<p class="font-bold">Event ownership</p>
				{#if deleteUserEvents > 0}
					<p class="text-zinc-700 dark:text-zinc-300">
						This user created <strong>{deleteUserEvents}</strong> dynamic event{deleteUserEvents === 1
							? ''
							: 's'}. Choose what happens to those events:
					</p>
				{:else}
					<p class="text-zinc-700 dark:text-zinc-300">
						This user has no created dynamic events.
					</p>
				{/if}
			</div>

			<label class="block space-y-1">
				<span class="text-sm font-semibold">Reassign dynamic events to</span>
				<select
					class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
					bind:value={reassignToUserId}
					disabled={isWorking}
				>
					<option value="null">Unassign (no creator)</option>
					{#each reassignOptions as u}
						<option value={String(u.id)}>{u.name || u.email} · {u.role}</option>
					{/each}
				</select>
			</label>

			<label class="block space-y-1">
				<span class="text-sm"
					>Type <strong class="uppercase text-error-500">delete</strong> to confirm:</span
				>
				<input
					class="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
					type="text"
					bind:value={userConfirmInput}
					placeholder="delete"
					disabled={isWorking}
				/>
			</label>

			{#if errorMessage}
				<p class="text-error-500 text-sm text-center font-semibold break-words">{errorMessage}</p>
			{/if}

			<footer class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
				<button
					type="button"
					class="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold"
					onclick={closeUserDelete}
					disabled={isWorking}>Cancel</button
				>
				<button
					type="button"
					class="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold"
					onclick={handleUserDelete}
					disabled={isWorking || userConfirmInput.toLowerCase() !== 'delete'}
				>
					{isWorking ? 'Deleting…' : 'Delete User'}
				</button>
			</footer>
		</div>
	</div>
{/if}

<!-- Dynamic event scorers modal -->
{#if scorersEventId !== null}
	<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
		<div
			class="card p-5 sm:p-6 w-full sm:max-w-md variant-glass-surface shadow-2xl space-y-4 border border-indigo-500/30 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
		>
			<header class="space-y-1">
				<h3 class="text-lg font-bold uppercase text-indigo-600 dark:text-indigo-400">Edit Scorers</h3>
				<p class="text-sm text-zinc-600 dark:text-zinc-300 break-words">{scorersEventName}</p>
			</header>

			<div class="rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm space-y-0.5">
				<p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Creator (always allowed)</p>
				{#if scorersCreatorId !== null}
					{@const c = data.users.find((u) => u.id === scorersCreatorId)}
					<p class="font-semibold">{userLabel(c)}</p>
					{#if c?.email}<p class="text-xs text-zinc-400">{c.email}</p>{/if}
				{:else}
					<p class="text-zinc-500 italic">Unassigned</p>
				{/if}
			</div>

			<div class="space-y-2">
				<p class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Additional scorers</p>
				{#if scorerDraftIds.length === 0}
					<p class="text-xs text-zinc-500 italic">None</p>
				{:else}
					<ul class="space-y-1.5">
						{#each scorerDraftIds as uid}
							{@const u = data.users.find((x) => x.id === uid)}
							<li class="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 px-2.5 py-2">
								<div class="min-w-0">
									<p class="text-sm font-semibold truncate">{userLabel(u) || `User #${uid}`}</p>
									{#if u?.email}<p class="text-[11px] text-zinc-400 truncate">{u.email}</p>{/if}
								</div>
								<button type="button" class="text-xs font-bold text-red-600" onclick={() => removeAdminScorerDraft(uid)}>Remove</button>
							</li>
						{/each}
					</ul>
				{/if}

				<div class="flex gap-2 items-center">
					<select
						class="flex-1 min-w-0 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm px-2 py-2"
						bind:value={scorerPickerId}
						disabled={scorersBusy}
					>
						<option value="">Add a user…</option>
						{#each adminEligibleScorers as u}
							<option value={String(u.id)}>{userLabel(u)} ({u.email})</option>
						{/each}
					</select>
					<button
						type="button"
						class="shrink-0 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold disabled:opacity-40"
						onclick={addAdminScorerDraft}
						disabled={!scorerPickerId || scorersBusy}
					>Add</button>
				</div>
			</div>

			{#if errorMessage}
				<p class="text-error-500 text-sm text-center font-semibold break-words">{errorMessage}</p>
			{/if}

			<footer class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
				<button
					type="button"
					class="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold"
					onclick={closeScorersEditor}
					disabled={scorersBusy}>Cancel</button
				>
				<button
					type="button"
					class="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold"
					onclick={saveAdminScorers}
					disabled={scorersBusy}
				>
					{scorersBusy ? 'Saving…' : 'Save Scorers'}
				</button>
			</footer>
		</div>
	</div>
{/if}
