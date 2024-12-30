<script lang="ts">
  import { page } from '$app/state';
  import { buttonVariants } from '@/components/ui/button';
  import * as DropdownMenu from '@/components/ui/dropdown-menu';
  import { Home, Thermometer } from 'lucide-svelte';
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
  }

  const homeLink = {
    name: 'Home',
    icon: Home,
  }

  const { link }: { link: Snippet<[Route]> } = $props();

  const currentPage = $derived(page.url.pathname ? routesMap[page.url.pathname] : homeLink);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: 'secondary' })}>
    {@render link(currentPage)}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      {#each Object.entries(routesMap) as [route, data]}
        <DropdownMenu.Item class={{ 'bg-secondary': currentPage.name === data.name }}>
          <data.icon />
          <a href={route}>{data.name}</a>
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
