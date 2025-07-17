<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import { CircleUser, LogOut, User } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Profile from './profile.svelte';
	import { t } from '@/translations';
	import { globalState } from '@/shared/runes.svelte';
	import * as Dialog from '../dialog';
	import * as Tabs from '@/components/ui/tabs/index';
	import { toast } from 'svelte-sonner';
	import AuthCard from '../AuthCard.svelte';
	import { enhance } from '$app/forms';

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	let { authForm, deleteForm }: Props = $props();

	let dialogOpen = $state(false);
	let tabsValue = $state('');
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
			<DropdownMenu.Item onclick={() => (dialogOpen = true)}>
				<User class="mr-2 h-4 w-4" />
				{$t('menu.actions.account.item')}
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<form method="POST" action="/actions?/logout" class="w-full" use:enhance>
					<button
						type="submit"
						class="flex w-full cursor-default items-center gap-2 text-left text-red-500"
					>
						<LogOut class="mr-2 h-4 w-4" />
						{$t('menu.actions.account.logout')}
					</button>
				</form>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Profile bind:open={dialogOpen} data={deleteForm} />
{:else}
	<Dialog.Root bind:open={globalState.authOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>
			<CircleUser class="mr-2 h-4 w-4" />
			{$t('menu.actions.account.login')}</Dialog.Trigger
		>
		<Dialog.Content class="sm:max-w-md">
			<Tabs.Root bind:value={tabsValue} class="mt-5">
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger value="register">{$t('auth.tab_register')}</Tabs.Trigger>
					<Tabs.Trigger value="login">{$t('auth.tab_login')}</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="register">
					<AuthCard
						success={() => toast.success($t('auth.register_success'))}
						failed={() => toast.error($t('auth.register_failed'))}
						id="register"
						data={authForm}
						bind:value={tabsValue}
					/>
				</Tabs.Content>
				<Tabs.Content value="login">
					<AuthCard
						success={() => toast.success($t('auth.login_success'))}
						failed={() => toast.error($t('auth.login_failed'))}
						id="login"
						data={authForm}
						bind:value={tabsValue}
					/>
				</Tabs.Content>
			</Tabs.Root>
		</Dialog.Content>
	</Dialog.Root>
{/if}
