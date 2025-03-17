<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import type { DeleteSchema } from '@/shared/schemas';
	import { CircleUser, LogOut } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Profile from './profile.svelte';

	interface Props {
		user?: string;
		data: SuperValidated<DeleteSchema>;
	}

	let { user, data }: Props = $props();
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
			<DropdownMenu.Item class="text-red-500">
				<form method="POST" action="?/logout">
					<button type="submit" class="flex cursor-default items-center gap-2">
						<LogOut class="mr-2" /> Log out
					</button>
				</form>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
