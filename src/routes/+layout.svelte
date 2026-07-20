<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	// import '@skeletonlabs/skeleton/themes/theme-modern.css';
	// import '../theme.postcss';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { afterNavigate } from '$app/navigation';

	// Svelte 5 props
	let { data, children } = $props<{ data: any; children: any }>();

	let menuOpen = $state(false);

	function closeMenu() {
		menuOpen = false;
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && menuOpen) closeMenu();
	}

	afterNavigate(() => {
		menuOpen = false;
	});
</script>

<svelte:window onkeydown={onKeydown} />

<header
	class="sticky top-0 z-40 flex items-center justify-between gap-3 variant-glass-secondary px-3 sm:px-4 py-2 max-w-full"
>
	<button
		type="button"
		class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300/60 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition"
		onclick={toggleMenu}
		aria-label={menuOpen ? 'Close menu' : 'Open menu'}
		aria-expanded={menuOpen}
		aria-controls="app-nav-drawer"
	>
		{#if menuOpen}
			<!-- X icon -->
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		{:else}
			<!-- Hamburger icon -->
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
			</svg>
		{/if}
	</button>

	<div class="flex items-center gap-2 sm:gap-3 min-w-0">
		{#if data?.user}
			<span class="text-xs sm:text-sm font-bold text-zinc-500 truncate max-w-[40vw] sm:max-w-none">
				{data.user.name}
			</span>
			<form method="POST" action="/login?/logout" use:enhance>
				<button
					type="submit"
					class="btn btn-sm variant-filled-surface hover:variant-filled-warning text-xs font-semibold px-2 py-1 rounded"
				>
					Sign Out
				</button>
			</form>
		{:else}
			<a class="text-xs font-bold uppercase hover:text-indigo-600 px-1" href="/login">Sign In</a>
		{/if}
	</div>
</header>

<!-- Backdrop -->
{#if menuOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
		aria-label="Close menu"
		onclick={closeMenu}
	></button>
{/if}

<!-- Slide-in drawer -->
<aside
	id="app-nav-drawer"
	class="fixed top-0 left-0 z-50 h-full w-[min(18rem,85vw)] variant-glass-secondary border-r border-zinc-200/40 dark:border-zinc-800 shadow-xl
		transform transition-transform duration-200 ease-out
		{menuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'}"
	aria-hidden={!menuOpen}
>
	<div class="flex items-center justify-between px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-800">
		<span class="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Menu</span>
		<button
			type="button"
			class="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-50"
			onclick={closeMenu}
			aria-label="Close menu"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<nav class="flex flex-col p-3 gap-1 font-sans">
		<a
			class="rounded-lg px-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition"
			href="/"
			onclick={closeMenu}
		>Home</a>
		<a
			class="rounded-lg px-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition"
			href="/clays"
			onclick={closeMenu}
		>Shoot</a>
		<a
			class="rounded-lg px-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition"
			href="/slide"
			onclick={closeMenu}
		>Slide</a>
		<a
			class="rounded-lg px-3 py-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition"
			href="/about"
			onclick={closeMenu}
		>About</a>

		{#if data?.isAdmin}
			<a
				class="rounded-lg px-3 py-2.5 text-base font-semibold text-error-500 hover:text-error-600 hover:bg-error-500/10 transition uppercase tracking-wider"
				href="/admin/dashboard"
				onclick={closeMenu}
			>Admin</a>
		{/if}

		<div class="my-2 border-t border-zinc-200/50 dark:border-zinc-800"></div>

		<div class="flex items-center justify-between px-3 py-2">
			<span class="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Theme</span>
			<LightSwitch />
		</div>
	</nav>
</aside>

<div class="overflow-x-hidden max-w-full">
	{@render children()}
</div>
