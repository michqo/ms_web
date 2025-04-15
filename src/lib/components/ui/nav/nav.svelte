<script module>
  type Route = {
    name: string;
    icon: any;
  };

  export { type Route };
</script>

<script lang="ts">
  import { Button, buttonVariants } from '@/components/ui/button';
  import { Github, User } from 'lucide-svelte';
  import ThemeToggle from './themetoggle.svelte';
  import Actions from './actions.svelte';
  import Links from './links.svelte';
  import I18n from './i18n.svelte';
  import type { SuperValidated } from 'sveltekit-superforms';
  import type { DeleteSchema } from '@/shared/schemas';
  import { page } from '$app/state';

  interface Props {
    data: SuperValidated<DeleteSchema>
  }

  let { data }: Props = $props();

  const authLink = {
    name: 'Auth',
    icon: User,
  };
</script>

{#snippet link(data: Route)}
  <data.icon />
  <span>{data.name}</span>
{/snippet}

<div
  class="sticky inset-0 z-50 flex w-full justify-center border-b border-border/40 bg-primary-foreground/60 p-4 backdrop-blur-md"
>
  <div class="flex w-full max-w-xl items-center justify-between">
    {#if page.url.pathname === '/auth'}
      <div class={buttonVariants({ variant: 'secondary' })}>
        {@render link(authLink)}
      </div>
    {/if}
    <Links />
    <div class="flex items-center gap-x-2">
      <ThemeToggle />
      <Button variant="ghost" size="icon" href="https://github.com/michqo/ms_web" target="_blank">
        <Github />
      </Button>
      <I18n />
      <Actions {data} />
    </div>
  </div>
</div>
