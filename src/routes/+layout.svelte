<script lang='ts'>
	// The ordering of these imports is critical to your app working properly
	// import '@skeletonlabs/skeleton/themes/theme-modern.css';
	// import '../theme.postcss';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';

	// Svelte 5 props
	let { data, children } = $props<{ data: any; children: any }>();
</script>
<nav class="flex min-w-[390px] sticky top-0 font-sans justify-end items-center variant-glass-secondary mb-2 px-4 py-1">
	<a class="m-3 font-semibold text-zinc-900 dark:text-zinc-50" href="/">Home</a>
	<a class="m-3 font-semibold text-zinc-900 dark:text-zinc-50" href="/clays">Shoot</a>
	<a class="m-3 font-semibold text-zinc-900 dark:text-zinc-50" href="/shootEvents">Events</a>
	
	{#if data?.user}
		<a class="m-3 font-semibold text-zinc-900 dark:text-zinc-50 hover:text-indigo-600 transition" href="/shootEvents/new-dynamic">Create Event</a>
	{/if}

	<a class="m-3 font-semibold text-zinc-900 dark:text-zinc-50" href="/slide">Slide</a>
	<a class="m-3 font-semibold text-zinc-900 dark:text-zinc-50" href="/about">About</a>

	{#if data?.isAdmin}
		<a class="m-3 font-semibold text-error-500 hover:text-error-600 transition uppercase tracking-wider" href="/admin/dashboard">Admin</a>
	{/if}

	<div class="h-4 w-px bg-zinc-400 dark:bg-zinc-700 mx-2"></div>

	{#if data?.user}
		<div class="flex items-center gap-3">
			<span class="text-xs font-bold text-zinc-500">Hello, {data.user.name}</span>
			<form method="POST" action="/admin/login?/logout" use:enhance>
				<button type="submit" class="btn btn-sm variant-filled-surface hover:variant-filled-warning text-xs font-semibold px-2 py-1 rounded">
					Sign Out
				</button>
			</form>
		</div>
	{:else}
		<a class="m-3 text-xs font-bold uppercase hover:text-indigo-600" href="/admin/login">Sign In</a>
	{/if}

	<LightSwitch class="m-3" />
</nav>
{@render children()}