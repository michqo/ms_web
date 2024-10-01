<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '@/components/ui/ThemeToggle.svelte';
</script>

<Button on:click={() => toast('Hello world')}>Show toast</Button>

<ThemeToggle />
