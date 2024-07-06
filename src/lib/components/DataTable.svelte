<script lang="ts">
    export let myData;
    $: myData
</script>

<table>
    <thead>
        <tr>
            <th>Rank</th>
            <th>TimeStamp</th>
            <th>Slider</th>
            <th>Speed (FPS)</th>
            <th>Speed (MPH)</th>
        </tr>
    </thead>
    <tbody>
        {#each myData as row, i (i)}
            <tr>
                <td>{i+1}</td>
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
    thead th {
        padding: 5px 10px;
    }
    tbody td {
        border: 1px solid #f5f5f5;
        padding: 5px 10px;
    }
    tbody tr {
        transition: all, 0.2s;
    }
    tbody tr:hover {
        background: #444;
    }
</style>        
        