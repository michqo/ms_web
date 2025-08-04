<script lang="ts">
	import { enhance } from '$app/forms';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { globalState } from '@/shared/runes.svelte';
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { CircleUser, LogOut, User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import AuthCard from '../AuthCard.svelte';
	import * as Dialog from '../dialog';
	import Profile from './profile.svelte';

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	let { authForm, deleteForm }: Props = $props();

	let tabsValue = $state('register');
</script>

{#if globalState.user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
			<CircleUser class="mr-2 h-4 w-4" />
			{globalState.user}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Label>{$t('menu.actions.account.label')}</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => (globalState.userOpen = true)}>
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
	<Profile data={deleteForm} />
{:else}
	<Dialog.Root bind:open={globalState.authOpen}>
		<Dialog.Trigger
			class={[buttonVariants({ variant: 'default', size: 'sm' }), 'flex items-center gap-2']}
		>
			<CircleUser class="h-4 w-4" />
			{$t('menu.actions.account.login')}</Dialog.Trigger
		>
		<Dialog.Content
			class="border-0 bg-white/80 shadow-2xl backdrop-blur-lg sm:max-w-md dark:bg-zinc-800/80"
		>
			{#if tabsValue == 'register'}
				<AuthCard
					success={() => toast.success($t('auth.register_success'))}
					failed={() => toast.error($t('auth.register_failed'))}
					id="register"
					data={authForm}
					bind:value={tabsValue}
				/>
			{:else if tabsValue == 'login'}
				<AuthCard
					success={() => toast.success($t('auth.login_success'))}
					failed={() => toast.error($t('auth.login_failed'))}
					id="login"
					data={authForm}
					bind:value={tabsValue}
				/>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/if}
