<script lang="ts">
    import shell from '$lib/images/shell.svg';
	import shellshot from '$lib/images/shellshot.svg';
	import shellhit from '$lib/images/shell_shot.svg';
	import clay from '$lib/images/capshield.svg';
	import clayhit from '$lib/images/capshield_broken.svg';
	import claymiss from '$lib/images/capshield_miss.svg';
</script> 

<div class="flex-1 card min-w-[350px] max-w-[900px] px-1 mx-auto my-2 variant-ghost-primary">
    <h1 class="text-left">Legend</h1>
    <!-- <div class="flex justify-around my-1">
        <div class="card font-sans my-1 mx-2 p-2 variant-ghost-success">Now Shooting</div>
        <div class="card font-sans my-1 mx-2 p-2 variant-ghost-warning">On-Deck</div>
        <div class="card font-sans my-1 mx-2 p-2 variant-ghost-tertiary">Event Winner!</div>
    </div> -->
    <div class="flex justify-around">
        <div class="flex-col mx-1 px-1">
            <div class="flex justify-center"><img class="w-6" src={clay} alt="clay" /></div>
            <div class="my-1 font-mono">clay</div>
        </div>
        <div class="flex-col mx-1 px-1">
            <div class="flex justify-center"><img class="w-6" src={clayhit} alt="clay" /></div>
            <div class="my-1 font-mono">clay hit</div>
        </div>
        <div class="flex-col mx-1 px-1">
            <div class="flex justify-center"><img class="w-6" src={claymiss} alt="clay" /></div>
            <div class="my-1 font-mono">clay miss</div>
        </div>
        <div class="flex-col mx-1 px-1">
            <div class="flex justify-center"><img class="w-3" src={shell} alt="ammo" /></div>
            <div class="my-1 font-mono">ammo</div>
        </div>
        <div class="flex-col mx-1 px-1">
            <div class="flex justify-center"><img class="w-3" src={shellhit} alt="shot hit" /></div>
            <div class="my-1 font-mono">shot hit</div>
        </div>
        <div class="flex-col mx-1 px-1">
            <div class="flex justify-center"><img class="w-3" src={shellshot} alt="shot miss" /></div>
            <div class="my-1 font-mono">shot miss</div>
        </div>
    </div>
</div>