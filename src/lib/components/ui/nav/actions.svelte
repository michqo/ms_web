<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import type { DeleteSchema } from '@/shared/schemas';
	import { CircleUser, LogOut, User } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Profile from './profile.svelte';
	import { t } from '@/translations';
	import { globalState } from '@/shared/runes.svelte';

	interface Props {
		data: SuperValidated<DeleteSchema>;
	}

	let { data }: Props = $props();

	let dialogOpen = $state(false);
</script>

{#if globalState.user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
			<CircleUser class="mr-2 h-4 w-4" />
			{globalState.user}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Label>{$t('menu.actions.account.label')}</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => dialogOpen = true}>
				<User class="mr-2 h-4 w-4" /> {$t('menu.actions.account.item')}
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<form method="POST" action="?/logout" class="w-full">
					<button type="submit" class="flex cursor-default items-center gap-2 text-red-500 w-full text-left">
						<LogOut class="mr-2 h-4 w-4" /> {$t('menu.actions.account.logout')}
					</button>
				</form>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Profile bind:open={dialogOpen} {data} />
{:else}
	<a href="/auth" class={buttonVariants({ variant: 'outline' })}>
		<CircleUser class="mr-2 h-4 w-4" />
		{$t('menu.actions.account.login')}
	</a>
{/if}
