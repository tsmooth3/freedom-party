<script lang="ts">
	import { page } from '$app/stores';

	let redirectTo = $derived($page.url.searchParams.get('redirectTo'));
	let googleLoginUrl = $derived(
		redirectTo ? `/login/google?redirectTo=${encodeURIComponent(redirectTo)}` : '/login/google'
	);
</script>

<svelte:head>
	<title>Sign In - Freedom Party</title>
</svelte:head>

<div class="flex items-center justify-center min-h-[70vh] px-4">
	<div class="card p-8 w-full max-w-md shadow-xl variant-glass-surface text-center space-y-8">
		<header class="space-y-3">
			<h1 class="h2 text-primary-500 font-extrabold uppercase tracking-wider">Welcome</h1>
			<p class="text-surface-600 dark:text-surface-300">
				Sign in to access your scoring events, record hits, and manage rounds.
			</p>
		</header>

		<div class="space-y-4">
			<a
				href={googleLoginUrl}
				class="btn variant-filled-primary w-full py-4 font-bold uppercase tracking-wide flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
			>
				<!-- Simple SVG Google Icon -->
				<svg class="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
					<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
					<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
					<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
				</svg>
				Sign In with Google
			</a>
		</div>

		<footer class="text-xs text-surface-500 dark:text-surface-400">
			By signing in, you agree to our 
			<a href="/guidelines" class="underline text-primary-500 hover:text-primary-600 transition">standard event guidelines</a>.
		</footer>
	</div>
</div>
