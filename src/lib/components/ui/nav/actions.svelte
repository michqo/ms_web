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
	import Profile from './profile/profile.svelte';

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	let { authForm, deleteForm }: Props = $props();

	let tabsValue = $state('register');
</script>

{#if globalState.user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
			<CircleUser class="h-4 w-4" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="p-2">
			<!-- Header -->
			<div class="mb-2 px-3 py-2">
				<div class="mb-1 flex items-center gap-2">
					<div
						class="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-2 text-blue-700 dark:from-blue-950/50 dark:to-cyan-950/50 dark:text-blue-300"
					>
						<User class="h-3.5 w-3.5" />
					</div>
					<DropdownMenu.Label class="p-0 text-sm font-semibold text-slate-900 dark:text-slate-100">
						{globalState.user}
					</DropdownMenu.Label>
				</div>
			</div>
			<DropdownMenu.Separator />
			<div class="space-y-1">
				<DropdownMenu.Item
					onclick={() => (globalState.userOpen = true)}
					class="group cursor-pointer p-3 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
				>
					<div
						class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 p-2 transition-all duration-200 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700"
					>
						<User class="h-4 w-4" />
					</div>
					<span class="text-sm font-medium text-slate-900 dark:text-slate-100">
						{$t('menu.actions.account.item')}
					</span>
				</DropdownMenu.Item>
				<form method="POST" action="/actions?/logout" class="w-full" use:enhance>
					<DropdownMenu.Item
						class="group w-full cursor-pointer p-3 text-red-500 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/50"
					>
						<div
							class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-red-100/50 p-2 transition-all duration-200 group-hover:bg-red-100 dark:bg-red-900/50 dark:group-hover:bg-red-900"
						>
							<LogOut class="h-4 w-4" />
						</div>
						<span class="text-sm font-medium">{$t('menu.actions.account.logout')}</span>
					</DropdownMenu.Item>
				</form>
			</div>
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
