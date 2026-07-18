<script lang="ts">
	import { enhance } from '$app/forms';

	// Svelte 5 props
	let { form } = $props<{ form: any }>();
</script>

<svelte:head>
	<title>Admin Login - Freedom Party</title>
</svelte:head>

<div class="flex items-center justify-center min-h-[70vh] px-4">
	<div class="card p-8 w-full max-w-md shadow-xl variant-glass-surface space-y-6">
		<header class="text-center space-y-2">
			<h1 class="h2 text-primary-500 font-bold uppercase tracking-wider">Admin Portal</h1>
			<p class="text-surface-600 dark:text-surface-300">Enter the passphrase to access database maintenance</p>
		</header>

		<form method="POST" action="?/login" use:enhance class="space-y-4">
			<label class="label">
				<span>Passphrase</span>
				<input
					class="input p-3 rounded"
					type="password"
					name="password"
					placeholder="••••••••••••"
					required
					autocomplete="current-password"
				/>
			</label>

			{#if form?.incorrect}
				<div class="alert variant-filled-error p-3 rounded text-sm text-center">
					{form.message}
				</div>
			{/if}

			<button type="submit" class="btn variant-filled-primary w-full py-3 font-semibold uppercase tracking-wide">
				Unlock Admin Dashboard
			</button>
		</form>
	</div>
</div>
