<script lang="ts">
	import { api } from "@/shared/api";
	import { createQuery } from "@tanstack/svelte-query";

  const dataQuery = createQuery({
    queryKey: ['forecast'],
    queryFn: () => api.getForecast()
  })
</script>

<main class="grid h-svh items-center justify-center">
  {#if $dataQuery.data}
    {#each $dataQuery.data!.temperature_instant as temp}
      <p>{temp}</p>
    {/each}
  {/if}
</main>