<script lang="ts">
	import { enhance } from '$app/forms';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import * as Dialog from '../dialog';
	import AuthCard from '../AuthCard.svelte';
	import Profile from './profile/profile.svelte';
	import { globalState } from '@/shared/runes.svelte';
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { CircleUser, LogOut, User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { setMockMode } from '@/shared/runes.svelte';

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	let { authForm, deleteForm }: Props = $props();

	let tabsValue = $state('register');
</script>

{#if globalState.user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
			<CircleUser class="h-4 w-4" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-48 p-1 font-mono">
			<div class="px-2 py-3">
				<div class="text-muted-foreground text-xs">{$t('menu.actions.account.label')}</div>
				<div class="text-sm font-semibold">{globalState.user}</div>
			</div>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={() => (globalState.userOpen = true)}
				class="text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer rounded-md px-2 py-2 text-xs transition-colors"
			>
				<User class="h-3.5 w-3.5" />
				{$t('menu.actions.account.item')}
			</DropdownMenu.Item>
			<form method="POST" action="/actions?/logout" use:enhance>
				<button
					type="submit"
					class="text-destructive hover:bg-destructive/10 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 font-mono text-xs font-medium transition-colors"
				>
					<LogOut class="h-3.5 w-3.5" />
					{$t('menu.actions.account.logout')}
				</button>
			</form>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Profile data={deleteForm} />
{:else}
	<Dialog.Root bind:open={globalState.authOpen}>
		<Dialog.Trigger class={buttonVariants({ variant: 'default', size: 'sm', class: 'gap-1.5' })}>
			<CircleUser class="h-3.5 w-3.5" />
			{$t('auth.login')}
		</Dialog.Trigger>
		<Dialog.Content class="bg-background/80 border-0 shadow-2xl backdrop-blur-lg sm:max-w-md">
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

			<div class="border-border/50 mt-4 border-t pt-4">
				<button
					onclick={() => {
						setMockMode(!globalState.mockMode);
						if (!globalState.mockMode) {
							globalState.authOpen = false;
						}
					}}
					class="hover:bg-muted/40 flex w-full items-center justify-between rounded-md p-2 text-left transition-colors"
				>
					<span class="text-muted-foreground font-mono text-xs">Demo mode</span>
					<div
						class="flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors"
						class:bg-primary={globalState.mockMode}
						class:bg-muted={!globalState.mockMode}
					>
						<div
							class="bg-background h-4 w-4 rounded-full shadow-sm transition-transform"
							class:translate-x-4={globalState.mockMode}
							class:translate-x-0={!globalState.mockMode}
						></div>
					</div>
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
