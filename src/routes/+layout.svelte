<script lang='ts'>
	// The ordering of these imports is critical to your app working properly
	// import '@skeletonlabs/skeleton/themes/theme-modern.css';
	// import '../theme.postcss';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { LightSwitch } from '@skeletonlabs/skeleton';
</script>
<nav class="flex min-w-[390px] sticky top-0 font-sans justify-end variant-glass-secondary mb-2 ">
	<a class="m-3" href="/">Home</a>
	<a class="m-3" href="/clays">Shoot</a>
	<a class="m-3" href="/slide">Slide</a>
	<a class="m-3" href="/about">About</a>
	<LightSwitch class="m-3" />
</nav>
<slot />