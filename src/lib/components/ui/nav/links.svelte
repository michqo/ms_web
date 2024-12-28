<script lang="ts">
  import { page } from '$app/stores';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';

  const routesMap: Record<string, string> = {
    '/': 'Home',
  }

  const currentPage = $derived($page.url.pathname ? routesMap[$page.url.pathname] : 'Home');
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' })}>
    {currentPage}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      {#each Object.entries(routesMap) as [route, name]}
        <DropdownMenu.Item>
          <a href={route}>{name}</a>
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
