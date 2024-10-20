<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { api } from '@/shared/api';
	import { createQuery } from '@tanstack/svelte-query';

	const userQuery = createQuery({
    queryKey: ['usersMe'],
    queryFn: () => api.getUsersMe()
  });
	</script>

<main class="grid h-screen items-center justify-center">
	<div class="grid w-[400px]">
		<p>{$userQuery.data ? $userQuery.data : ''}</p>
		<div class="grid gap-2 grid-cols-2">
			<Button href="/auth?for=register">Register</Button>
			<Button href="/auth?for=login">Log In</Button>
		</div>
	</div>
</main>
