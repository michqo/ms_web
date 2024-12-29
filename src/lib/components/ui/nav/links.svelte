<script lang="ts">
  import { page } from '$app/stores';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { Home } from 'lucide-svelte';

  type Route = {
    name: string;
    icon: any;
  }
  
  const routesMap: Record<string, Route> = {
    '/': {
      name: 'Home',
      icon: Home,
    },
  }

  const homeLink = {
    name: 'Home',
    icon: Home,
  }

  const currentPage = $derived($page.url.pathname ? routesMap[$page.url.pathname] : homeLink);
</script>

{#snippet link(route: string, data: Route)}
  <data.icon />
  <a href={route}>{data.name}</a>
{/snippet}

<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' })}>
    <currentPage.icon />
    <span>{currentPage.name}</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      {#each Object.entries(routesMap) as [route, data]}
        <DropdownMenu.Item>
          {@render link(route, data)}
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
