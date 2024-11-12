<script lang="ts">
	import { page } from '$app/stores';
	import * as Tabs from '@/components/ui/tabs/index';
	import type { PageData } from './$types';
	import AuthCard from '@/components/ui/AuthCard.svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const forParam = $page.url.searchParams.get('for');
</script>

<main class="grid h-screen items-center justify-center">
	<Tabs.Root value={forParam ? forParam : 'register'} class="w-[400px]">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="register">Register</Tabs.Trigger>
			<Tabs.Trigger value="login">Log In</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="register">
			<AuthCard
				success={() => toast.success('Successfully created account.')}
				failed={() => toast.error('Check for errors in the form.')}
				id="register"
				data={data.form}
			/>
		</Tabs.Content>
		<Tabs.Content value="login">
			<AuthCard
				success={() => toast.success('Successfully logged in.')}
				failed={() => toast.error('Incorrect username or password.')}
				id="login"
				data={data.form}
			/>
		</Tabs.Content>
	</Tabs.Root>
</main>
