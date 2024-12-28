<script lang="ts">
	import { goto } from '$app/navigation';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { api } from '@/shared/api';
	import { CircleUser, LogOut, User } from 'lucide-svelte';

	let { user }: { user?: string } = $props();

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
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					<User class="mr-2" /> Profile
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Group>
				<DropdownMenu.Item class="text-red-500" onclick={logOut}>
					<LogOut class="mr-2" /> Log out
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
