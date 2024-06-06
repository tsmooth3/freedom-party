<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
  
    let interval: number;
    let data: string | null = null;
  
    async function fetchData(): Promise<void> {
      try {
        const response = await fetch('/api/shootEvents/byLeader/42');
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        data = await response.json();
      } catch (error) {
        console.error(error);
      }
    }
  
    onMount(() => {
      fetchData();
      interval = window.setInterval(fetchData, 5000); // Poll every 5 seconds
    });
  
    onDestroy(() => {
      clearInterval(interval);
    });
  </script>
  
  <div>
    {#if data}
      <pre>{JSON.stringify(data,null, 2)}</pre>
    {/if}
  </div>
  