<script lang="ts">
  import { page } from '$app/state';
  import { buttonVariants } from '@/components/ui/button';
  import * as DropdownMenu from '@/components/ui/dropdown-menu';
  import { Cloud, Home, Thermometer } from 'lucide-svelte';
  import { type Route } from './nav.svelte';
	import type { Snippet } from 'svelte';

  const routesMap: Record<string, Route> = {
    '/': {
      name: 'Home',
      icon: Home,
    },
    '/measurements': {
      name: 'Measurements',
      icon: Thermometer,
    },
    '/forecast': {
      name: 'Forecast',
      icon: Cloud,
    },
  }
  
  const unknownRoute = {
    name: 'Unknown',
    icon: Home,
  }

  const { link }: { link: Snippet<[Route]> } = $props();

  const currentPage = $derived(routesMap[page.url.pathname] ?? unknownRoute);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: 'secondary' })}>
    {@render link(currentPage)}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      {#each Object.entries(routesMap) as [route, data]}
        <a href={route}>
          <DropdownMenu.Item class={{ 'bg-secondary': currentPage.name === data.name }}>
            {@render link(data)}
          </DropdownMenu.Item>
        </a>
      {/each}
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
