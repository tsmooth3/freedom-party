<script lang="ts">
    import { DataHandler } from '@vincjo/datatables';
    export let myData;
    const handler = new DataHandler(myData, { rowsPerPage: 25 });
    const rows = handler.getRows();
    $: myData, handler.setRows(myData)
</script>

<table>
    <thead>
        <tr>
            <th>TimeStamp</th>
            <th>Slider</th>
            <th>Speed (FPS)</th>
            <th>Speed (MPH)</th>
        </tr>
    </thead>
    <tbody>
        {#each $rows as row}
            <tr>
                <td>{row.timeStamp}</td>
                <td>{row.sliderName}</td>
                <td>{row.sliderFPS}</td>
                <td>{row.sliderMPH}</td>
            </tr>
        {/each}
    </tbody>
</table>


<style>
    thead {
        background: #777;
    }
    tbody td {
        border: 1px solid #f5f5f5;
        padding: 4px 20px;
    }
    tbody tr {
        transition: all, 0.2s;
    }
    tbody tr:hover {
        background: #444;
    }
</style>        
        