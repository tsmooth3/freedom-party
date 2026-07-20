<script lang="ts">
	import type { prismaSlide } from '$lib/shared/utils';

	let { myData }: { myData: prismaSlide[] } = $props();

	function formatTime(ts: Date | string): string {
		const d = typeof ts === 'string' ? new Date(ts) : ts;
		if (Number.isNaN(d.getTime())) return String(ts);
		return d.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function formatMph(mph: unknown): string {
		const n = typeof mph === 'number' ? mph : Number(mph);
		return Number.isFinite(n) ? n.toFixed(1) : String(mph ?? '—');
	}

	function medal(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return String(rank);
	}
</script>

{#if !myData?.length}
	<p class="text-center text-sm text-surface-500 dark:text-surface-400 py-6">No runs logged yet.</p>
{:else}
	<!-- Mobile: stacked cards (no horizontal scroll) -->
	<ul class="sm:hidden space-y-2" aria-label="Speed leaderboard">
		{#each myData as row, i (row.id ?? i)}
			<li
				class="rounded-lg border border-surface-300/40 dark:border-surface-600/40 bg-surface-50/40 dark:bg-surface-800/40 px-3 py-2.5"
			>
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex items-center gap-2">
						<span class="shrink-0 w-8 text-center text-lg font-bold tabular-nums" aria-label="Rank {i + 1}">
							{medal(i + 1)}
						</span>
						<div class="min-w-0">
							<p class="font-semibold truncate leading-tight">{row.sliderName}</p>
							<p class="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
								{formatTime(row.timeStamp)}
							</p>
						</div>
					</div>
					<div class="shrink-0 text-right">
						<p class="text-lg font-extrabold tabular-nums text-primary-500 leading-none">
							{row.sliderFPS}
							<span class="text-[10px] font-semibold uppercase tracking-wide text-surface-500 ml-0.5">fps</span>
						</p>
						<p class="text-xs text-surface-600 dark:text-surface-300 mt-1 tabular-nums">
							{formatMph(row.sliderMPH)} mph
						</p>
					</div>
				</div>
			</li>
		{/each}
	</ul>

	<!-- Desktop / tablet: full table -->
	<div class="hidden sm:block w-full overflow-x-auto">
		<table class="w-full table-fixed text-sm">
			<colgroup>
				<col class="w-[12%]" />
				<col class="w-[28%]" />
				<col class="w-[24%]" />
				<col class="w-[18%]" />
				<col class="w-[18%]" />
			</colgroup>
			<thead>
				<tr class="text-left uppercase tracking-wider text-xs text-surface-600 dark:text-surface-300 border-b border-surface-300/50 dark:border-surface-600/50">
					<th class="py-2 px-2 font-semibold">Rank</th>
					<th class="py-2 px-2 font-semibold">When</th>
					<th class="py-2 px-2 font-semibold">Slider</th>
					<th class="py-2 px-2 font-semibold text-right">FPS</th>
					<th class="py-2 px-2 font-semibold text-right">MPH</th>
				</tr>
			</thead>
			<tbody>
				{#each myData as row, i (row.id ?? i)}
					<tr class="border-b border-surface-200/40 dark:border-surface-700/40 last:border-0 hover:bg-surface-200/30 dark:hover:bg-surface-700/30 transition-colors">
						<td class="py-2.5 px-2 font-bold tabular-nums">{medal(i + 1)}</td>
						<td class="py-2.5 px-2 text-surface-600 dark:text-surface-300 whitespace-nowrap">
							{formatTime(row.timeStamp)}
						</td>
						<td class="py-2.5 px-2 font-medium truncate" title={row.sliderName}>{row.sliderName}</td>
						<td class="py-2.5 px-2 text-right font-extrabold tabular-nums text-primary-500">
							{row.sliderFPS}
						</td>
						<td class="py-2.5 px-2 text-right tabular-nums">{formatMph(row.sliderMPH)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
