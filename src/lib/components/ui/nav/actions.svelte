<script lang="ts">
	import { goto } from '$app/navigation';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { api } from '@/shared/api';
	import { CircleUser, LogOut } from 'lucide-svelte';
	import Profile from './profile.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { DeleteSchema } from '@/shared/schemas';

	interface Props {
		user?: string,
		data: SuperValidated<DeleteSchema>
	}

	let { user, data }: Props = $props();

	function logOut() {
		api.setAuthToken('');
		goto('/logout');
	}
</script>

{#if user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
			<CircleUser />
			{user}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
				<Profile {user} {data} />
			</DropdownMenu.Item>
			<DropdownMenu.Item class="text-red-500" onclick={logOut}>
				<LogOut class="mr-2" /> Log out
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
