<script lang="ts">
    import { Table, tableMapperValues } from '@skeletonlabs/skeleton';
    import type { TableSource } from '@skeletonlabs/skeleton';

    const sourceData = [
        { position: 1, name: 'Justin', topSpeed: 23, trys: 4 },
        { position: 2, name: 'Alex', topSpeed: 22, trys: 4 },
        { position: 3, name: 'Burt', topSpeed: 22, trys: 4 },
        { position: 4, name: 'Derek', topSpeed: 22, trys: 2 },
    ];

    const tableSimple: TableSource = {
        // A list of heading labels.
        head: ['Name', 'Trys', 'Top Speed MPH'],
        // The data visibly shown in your table body UI.
        body: tableMapperValues(sourceData, ['name', 'trys', 'topSpeed']),
        // Optional: The data returned when interactive is enabled and a row is clicked.
        // meta: tableMapperValues(sourceData, ['position', 'name', 'symbol', 'weight']),
        // Optional: A list of footer labels.
        // foot: ['Total', '', '<code class="code">5</code>']
    };

</script>
<div class="flex my-auto p-5 min-w-[390px] max-w-6xl mx-auto">
    <Table source={tableSimple} interactive={true} regionHeadCell="text-right" regionCell="text-right"/>
</div>