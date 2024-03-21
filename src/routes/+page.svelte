<script lang="ts">
	import flag  from '$lib/images/flag.gif'
	import { confetti } from '@neoconfetti/svelte';
	import { reduced_motion } from './reduced-motion';
	
	//Confetti
	// import { ConfettiExplosion } from 'svelte-confetti-explosion';
	import { tick } from 'svelte';
	let x: any, y: any;
	$: isVisible = false;	
	const handleClick = async (e: { clientX: any; clientY: any; }) => {
		x = e.clientX;
		y = e.clientY;
		isVisible = false;
		await tick();
		isVisible = true
	}
	
	// Get today's date
	export const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth();
	const currentDay = today.getDate();
	export const currentDate = new Date(currentYear, currentMonth, currentDay);
	// export const currentDate = new Date(currentYear, 6, 1);
	export const lastFourth = new Date(currentYear-1, 6, 4);
	export const theFourth = new Date(currentYear, 6, 4);
	export const lastpartyDay = getPartyDay(lastFourth);
	export const partyDay = getPartyDay(theFourth);
	if (currentDate > theFourth && currentDate > partyDay) {
		lastFourth.setFullYear(currentYear);
		lastpartyDay.setTime(getPartyDay(lastFourth).getTime());
		theFourth.setFullYear(currentYear + 1);
		partyDay.setTime(getPartyDay(theFourth).getTime());
	}
	export let daysToFreedom = calcDaysToFreedom();
	export let daysSinceFreedom = calcDaysSinceFreedom();


	// figure out today and days to next freedom party
	function getPartyDay(x: Date): Date {
		const weekday = x.getDay();
		if (weekday === 0) {
		return new Date(x.getTime() - 1 * 24 * 60 * 60 * 1000);
		}
		if (weekday === 1) {
		return new Date(x.getTime() - 2 * 24 * 60 * 60 * 1000);
		}
		if (weekday === 2) {
		return new Date(x.getTime() - 3 * 24 * 60 * 60 * 1000);
		}
		if (weekday === 3) {
		return new Date(x.getTime() + 3 * 24 * 60 * 60 * 1000);
		}
		if (weekday === 4) {
		return new Date(x.getTime() + 2 * 24 * 60 * 60 * 1000);
		}
		if (weekday === 5) {
		return new Date(x.getTime() + 1 * 24 * 60 * 60 * 1000);
		}
		if (weekday === 6) {
		return new Date(x.getTime());
		}
		throw new Error("Invalid weekday");
  	}


	function calcDaysToFreedom(): number {
		// Calculate days to freedom
		const daysToFreedom = Math.floor((partyDay.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
		return daysToFreedom;
	}
	function calcDaysSinceFreedom(): number {
		// Calculate days to freedom
		const daysSinceFreedom = Math.floor((currentDate.getTime() - lastpartyDay.getTime()) / (24 * 60 * 60 * 1000));
		return daysSinceFreedom;
	}

</script>

{#if isVisible}
	<div role="button" aria-pressed="false" style="position: absolute; left: {x}px; top:{y}px;"
	use:confetti={{
		particleCount: $reduced_motion ? 0 : undefined,
		force: 0.7,
		stageWidth: window.innerWidth,
		stageHeight: window.innerHeight,
		colors: ['#ff3e00', '#40b3ff', '#676778'],
		destroyAfterDone: true
	}}
/>
{/if}
{#if daysToFreedom === 0}
	<div class="flex my-1 mx-auto min-w-[390px] max-w-6xl justify-center">
		<div role="button" aria-pressed="false" tabindex="0" class="flex-1 card card-hover m-3 p-5 text-center variant-outline-primary" on:click={handleClick} on:keypress={undefined}>
			<h1 class="h1">LET'S PARTY!</h1>
			<h2 class="h2">Freedom Party is Today!</h2>
			<h4 class="h4">{partyDay.toDateString()}</h4>
		</div> 
	</div>
	<div
		style="position: absolute; left: 50%; top: 30%"
		use:confetti={{
			particleCount: $reduced_motion ? 0 : undefined,
			force: 0.7,
			stageWidth: window.innerWidth,
			stageHeight: window.innerHeight,
			colors: ['#ff3e00', '#40b3ff', '#e3e3e3']
		}}
	/>
{:else}
	<div class="flex my-1 mx-auto min-w-[390px] max-w-6xl justify-center">
		<div role="button" aria-pressed="false" tabindex="0" class="flex-1 card card-hover m-3 p-5 text-center variant-outline-primary" on:click={handleClick} on:keypress={undefined}>
			<h3 class="h3">{daysSinceFreedom} Days Since Last Freedom Party!</h3>
			<h4 class="h4">{lastpartyDay.toDateString()}</h4>
		</div> 
	</div>

	<div class="flex my-1 mx-auto min-w-[390px] max-w-6xl justify-center">
		<div role="button" aria-pressed="false" tabindex="0" class="flex-1 card card-hover m-3 p-5 text-center variant-outline-primary" on:click={handleClick} on:keypress={undefined}>
			<h3 class="h3">{daysToFreedom} Days Until Next Freedom Party!</h3>
			<h4 class="h4">{partyDay.toDateString()}</h4>
		</div> 
	</div>
{/if}
<div class="flex min-w-[390px] max-w-6xl my-auto mx-auto ">
	<div role="button" aria-pressed="false" tabindex="0" class="card card-hover m-3 overflow-hidden variant-outline-primary" on:click={handleClick} on:keypress={undefined}>
		<header>
			<img src={flag} class="w-full" alt="Post" />
		</header>
		<div class="p-4 space-y-4">
			<h2 class="h2" data-toc-ignore>Celebrating Freedom!</h2>
			<blockquote class="blockquote border-blue-600">
				<p>
					But the Day is past. The Second Day of
					<span class="highlight highlight-variant-2 highlight-red-500">July</span>
					<span class="highlight highlight-variant-2 highlight-red-500">1776, </span>
					will be the most memorable Epocha, in the History of America.
					I am apt to believe that 
					<span class="highlight highlight-variant-3 highlight-red-500">it</span>
					<span class="highlight highlight-variant-3 highlight-red-500">will</span>
					<span class="highlight highlight-variant-3 highlight-red-500">be</span>
					<span class="highlight highlight-variant-3 highlight-red-500">celebrated,</span>
					by succeeding Generations, as the great anniversary Festival. It ought to be 
					commemorated, as the Day of Deliverance by solemn Acts of Devotion 
					to God Almighty. 
					It ought to be solemnized with
					<span class="highlight highlight-variant-3 highlight-red-500">Pomp</span> and 
					<span class="highlight highlight-variant-3 highlight-blue-500">Parade,</span> with
					<span class="highlight highlight-variant-3 highlight-red-500">Shews,</span>
					<span class="highlight highlight-variant-3 highlight-blue-500">Games,</span>
					<span class="highlight highlight-variant-3 highlight-red-500">Sports,</span>
					<span class="highlight highlight-variant-3 highlight-blue-500">Guns,</span>
					<span class="highlight highlight-variant-3 highlight-red-500">Bells,</span>
					<span class="highlight highlight-variant-2 highlight-blue-500">Bonfires</span> and
					<span class="highlight highlight-variant-3 highlight-red-500">Illuminations</span> from
					one End	of this	Continent to the other from this Time forward
					<span class="highlight highlight-variant-4 highlight-red-500">forever</span>
					<span class="highlight highlight-variant-4 highlight-red-500"> more.</span>
				</p>
			</blockquote>
		</div>
		<hr class="opacity-50" />
		<footer class="p-4 flex justify-start items-center space-x-4">
			<div class="flex-auto flex justify-between items-center">
				<h6 class="font-bold">John Adams</h6>
				<small>Philadelphia {new Date(1776, 6, 3).toDateString()}</small>
			</div>
		</footer>
	</div>
</div>

<style>
	:global(body) {
		overflow-x: hidden;
	}
</style>

