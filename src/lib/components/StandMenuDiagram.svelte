<script lang="ts">
	import { browser } from '$app/environment';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import blankMenu from '$lib/images/blank_menu.png';

	let {
		sequence = '',
		class: className = '',
		imgClass = 'block w-full h-auto max-h-[min(42vh,360px)] object-contain mx-auto',
		/** Smaller strokes/badges for table thumbnails */
		compact = false,
		/** Click thumbnail to open full-screen; click again / Esc / backdrop to close */
		expandable = false,
		/** Unique prefix so multiple overlays on one page don't clash marker ids */
		uid = Math.random().toString(36).slice(2, 9)
	}: {
		sequence?: string;
		class?: string;
		imgClass?: string;
		compact?: boolean;
		expandable?: boolean;
		uid?: string;
	} = $props();

	let expanded = $state(false);

	/** Trap hex centers on blank_menu (percent viewBox 0–100). */
	const trapCoordinates: Record<number, { x: number; y: number }> = {
		1: { x: 17, y: 10 },
		2: { x: 83, y: 10 },
		3: { x: 82, y: 80 },
		4: { x: 50, y: 92 },
		5: { x: 18, y: 80 }
	};

	/**
	 * Flight endpoints:
	 * - Traps 1–2: toward shooters, ending above the grass line
	 * - Traps 3–5: toward top center, just below the launch-type text
	 */
	const flightEndpoints: Record<number, { x: number; y: number }> = {
		1: { x: 40, y: 56 },
		2: { x: 60, y: 56 },
		3: { x: 54, y: 20 },
		4: { x: 50, y: 18 },
		5: { x: 46, y: 20 }
	};

	// Presentation order colors: clay 1 red, 2 white, 3 blue, 4+ purple
	const LINE_COLORS = ['#ef4444', '#f8fafc', '#3b82f6', '#a855f7'];

	type FlightLine = {
		key: string;
		trap: number;
		order: number;
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		mx: number;
		my: number;
		color: string;
	};

	const flightLines = $derived.by((): FlightLine[] => {
		const digits = String(sequence ?? '')
			.replace(/\D/g, '')
			.split('')
			.map((d) => Number(d))
			.filter((n) => n >= 1 && n <= 5);

		const totalPerTrap: Record<number, number> = {};
		for (const t of digits) totalPerTrap[t] = (totalPerTrap[t] ?? 0) + 1;
		const seenCount: Record<number, number> = {};

		return digits.map((trap, i) => {
			const start = trapCoordinates[trap];
			const end = flightEndpoints[trap];
			const n = (seenCount[trap] = (seenCount[trap] ?? 0) + 1);
			const total = totalPerTrap[trap] ?? 1;
			const useLateral = total <= 1 ? 0 : (n - 1) * 2.4 - ((total - 1) * 2.4) / 2;
			const angle = Math.atan2(end.y - start.y, end.x - start.x);
			const nx = Math.cos(angle + Math.PI / 2);
			const ny = Math.sin(angle + Math.PI / 2);

			const x1 = start.x + nx * useLateral;
			const y1 = start.y + ny * useLateral;
			const x2 = end.x + nx * useLateral;
			const y2 = end.y + ny * useLateral;
			const mx = x1 + (x2 - x1) * 0.55;
			const my = y1 + (y2 - y1) * 0.55;

			return {
				key: `${i}-${trap}`,
				trap,
				order: i + 1,
				x1,
				y1,
				x2,
				y2,
				mx,
				my,
				color: LINE_COLORS[i % LINE_COLORS.length]
			};
		});
	});

	function lineStyle(isCompact: boolean) {
		return {
			strokeMain: isCompact ? 1.35 : 0.85,
			strokeGlow: isCompact ? 2.4 : 1.8,
			badgeR: isCompact ? 3.2 : 2.4,
			badgeFont: isCompact ? 3.4 : 2.6,
			dash: isCompact ? '3 1.6' : '2.2 1.4',
			blur: isCompact ? 0.8 : 0.6
		};
	}

	/** Move lightbox to <body> so table overflow/sticky stacking can't bury it. */
	function portal(node: HTMLElement) {
		if (!browser) return;
		const parent = document.body;
		parent.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) node.parentNode.removeChild(node);
			}
		};
	}

	function toggleExpanded(e?: Event) {
		if (!expandable) return;
		e?.stopPropagation();
		expanded = !expanded;
	}

	function closeExpanded() {
		expanded = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && expanded) {
			e.preventDefault();
			closeExpanded();
		}
	}

	$effect(() => {
		if (!browser || !expanded) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});
</script>

<svelte:window onkeydown={onKeydown} />

{#snippet diagram(opts: {
	isCompact: boolean;
	idSuffix: string;
	imageClass: string;
	wrapClass?: string;
})}
	{@const style = lineStyle(opts.isCompact)}
	{@const idBase = `${uid}-${opts.idSuffix}`}
	<div class="relative w-full overflow-hidden {opts.wrapClass ?? ''}">
		<img src={blankMenu} alt="Stand menu layout" class={opts.imageClass} />
		{#if flightLines.length > 0}
			<svg
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid meet"
				class="absolute inset-0 w-full h-full pointer-events-none select-none"
				aria-hidden="true"
			>
				<defs>
					{#each flightLines as line}
						<marker
							id="stand-menu-arrow-{idBase}-{line.key}"
							markerWidth="4"
							markerHeight="4"
							refX="3.2"
							refY="2"
							orient="auto"
							markerUnits="strokeWidth"
						>
							<path d="M0,0 L4,2 L0,4 Z" fill={line.color} />
						</marker>
					{/each}
					<filter id="stand-menu-glow-{idBase}" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation={style.blur} result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{#each flightLines as line}
					<line
						x1={line.x1}
						y1={line.y1}
						x2={line.x2}
						y2={line.y2}
						stroke={line.color}
						stroke-width={style.strokeGlow}
						stroke-linecap="round"
						opacity="0.25"
						filter="url(#stand-menu-glow-{idBase})"
					/>
					<line
						x1={line.x1}
						y1={line.y1}
						x2={line.x2}
						y2={line.y2}
						stroke={line.color}
						stroke-width={style.strokeMain}
						stroke-linecap="round"
						stroke-dasharray={style.dash}
						marker-end="url(#stand-menu-arrow-{idBase}-{line.key})"
						opacity="0.95"
					/>
					<circle
						cx={line.mx}
						cy={line.my}
						r={style.badgeR}
						fill="rgba(15,23,42,0.85)"
						stroke={line.color}
						stroke-width="0.45"
					/>
					<text
						x={line.mx}
						y={line.my}
						text-anchor="middle"
						dominant-baseline="central"
						fill={line.color}
						font-size={style.badgeFont}
						font-weight="800"
						font-family="system-ui, sans-serif"
					>
						{line.order}
					</text>
				{/each}
			</svg>
		{/if}
	</div>
{/snippet}

{#if expandable}
	<button
		type="button"
		class="block w-full p-0 m-0 border-0 bg-transparent cursor-zoom-in text-left {className}"
		onclick={toggleExpanded}
		aria-expanded={expanded}
		aria-label="Expand stand menu diagram"
		title="Click to enlarge"
	>
		{@render diagram({ isCompact: compact, idSuffix: 'thumb', imageClass: imgClass })}
	</button>
{:else}
	<div class={className}>
		{@render diagram({ isCompact: compact, idSuffix: 'static', imageClass: imgClass })}
	</div>
{/if}

{#if expandable && expanded}
	<!-- Portaled to body so sticky table cells / overflow can't stack above it -->
	<div
		use:portal
		class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm cursor-zoom-out"
		role="dialog"
		aria-modal="true"
		aria-label="Stand menu diagram enlarged"
		tabindex="-1"
		onclick={closeExpanded}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				closeExpanded();
			}
		}}
		transition:fade={{ duration: 180, easing: cubicOut }}
	>
		<div
			class="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[min(92vh,900px)] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-zinc-950"
			onclick={closeExpanded}
			onkeydown={() => {}}
			role="presentation"
			transition:scale={{ duration: 220, start: 0.88, opacity: 0.6, easing: cubicOut }}
		>
			{@render diagram({
				isCompact: false,
				idSuffix: 'full',
				imageClass: 'block w-full h-auto max-h-[min(92vh,900px)] object-contain mx-auto'
			})}
			<p
				class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/70 bg-black/50 px-2.5 py-1 rounded-full pointer-events-none"
			>
				Click to close
			</p>
		</div>
	</div>
{/if}
