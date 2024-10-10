<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '@/components/ui/ThemeToggle.svelte';
</script>

<main class="grid h-screen items-center justify-center">
	<div class="grid w-[400px]">
		<div class="grid gap-2 grid-cols-2">
			<Button href="/auth?for=register">Register</Button>
			<Button href="/auth?for=login">Log In</Button>
		</div>
	</div>
</main>
