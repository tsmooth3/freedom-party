<script lang="ts">
    import shell from '$lib/images/shell.svg';
	import shellshot from '$lib/images/shellshot.svg';
	import shellhit from '$lib/images/shell_shot.svg';
	import clay from '$lib/images/capshield.svg';
	import clayhit from '$lib/images/capshield_broken.svg';
	import claymiss from '$lib/images/capshield_miss.svg';
</script> 

<div class="flex-1 card mx-auto min-w-[350px] max-w-[600px] p-3 m-3 variant-ghost-primary">
    <h1 class=" text-left">Legend</h1>
    <div class="flex justify-evenly">
        <div class="flex-col m-2 p-1">
            <div class="flex justify-center"><img class="w-6" src={clay} alt="clay" /></div>
            <div class="my-1 font-mono">clay</div>
        </div>
        <div class="flex-col m-2 p-1">
            <div class="flex justify-center"><img class="w-6" src={clayhit} alt="clay" /></div>
            <div class="my-1 font-mono">clay hit</div>
        </div>
        <div class="flex-col m-2 p-1">
            <div class="flex justify-center"><img class="w-6" src={claymiss} alt="clay" /></div>
            <div class="my-1 font-mono">clay miss</div>
        </div>
    </div>
    <div class="flex justify-evenly">
        <div class="flex-col m-2 p-1">
            <div class="flex justify-center"><img class="w-3" src={shell} alt="ammo" /></div>
            <div class="my-1 font-mono">ammo</div>
        </div>
        <div class="flex-col m-2 p-1">
            <div class="flex justify-center"><img class="w-3" src={shellhit} alt="shot hit" /></div>
            <div class="my-1 font-mono">shot hit</div>
        </div>
        <div class="flex-col m-2 p-1">
            <div class="flex justify-center"><img class="w-3" src={shellshot} alt="shot miss" /></div>
            <div class="my-1 font-mono">shot miss</div>
        </div>
    </div>
</div>