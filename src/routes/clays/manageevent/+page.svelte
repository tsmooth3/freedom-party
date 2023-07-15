<script lang="ts">
    import { ammos, clays, hit, miss, clear } from '$lib/stores/store.ts'
</script>

<div class="flex flex-col my-auto px-30 text-center ">
    <p class="my-3">Ammos is {$ammos}</p>
    <p class="my-3">Clays is {$clays}</p>
    <button type="button" class="btn variant-filled mx-auto my-3" on:click={hit}>Hit</button>
    <button type="button" class="btn variant-filled mx-auto my-3" on:click={miss}>Miss</button>
    <button type="button" class="btn variant-filled mx-auto my-3" on:click={clear}>Reset</button>
</div>