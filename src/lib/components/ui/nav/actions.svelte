<script lang="ts">
	import { enhance } from '$app/forms';
	import { buttonVariants } from '@/components/ui/button';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import * as Dialog from '../dialog';
	import AuthCard from '../AuthCard.svelte';
	import Profile from './profile/profile.svelte';
	import { getGlobalState } from '@/shared/runes.svelte';
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { CircleUser, LogOut, User } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	const globalState = getGlobalState();

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	let { authForm, deleteForm }: Props = $props();
</script>

{#if globalState.demo}
	<a class="weather-button" href="/dash">{$t('weather.exitDemo')}</a>
{:else if globalState.user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			aria-label={$t('menu.actions.account.label')}
			class={buttonVariants({ variant: 'outline', size: 'icon', class: 'size-11' })}
		>
			<CircleUser class="h-4 w-4" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-52 p-1">
			<div class="px-2 py-3">
				<div class="text-muted-foreground text-xs">{$t('menu.actions.account.label')}</div>
				<div class="text-sm font-semibold">{globalState.user?.username}</div>
			</div>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={() => (globalState.userOpen = true)}
				class="text-muted-foreground hover:bg-muted/40 hover:text-foreground min-h-11 cursor-pointer rounded-md px-2 py-2 text-sm transition-colors"
			>
				<User class="h-3.5 w-3.5" />
				{$t('menu.actions.account.item')}
			</DropdownMenu.Item>
			<form method="POST" action="/actions?/logout" use:enhance>
				<button
					type="submit"
					class="text-destructive hover:bg-destructive/10 flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors"
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
		<Dialog.Trigger
			aria-label={$t('auth.login')}
			onclick={() => (globalState.authMode = 'login')}
			class={buttonVariants({
				variant: 'default',
				size: 'sm',
				class: 'size-11 gap-1.5 px-0 sm:w-auto sm:px-3'
			})}
		>
			<CircleUser aria-hidden="true" class="h-3.5 w-3.5" />
			<span class="hidden sm:inline">{$t('auth.login')}</span>
		</Dialog.Trigger>
		<Dialog.Content class="bg-background sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>{$t(`auth.${globalState.authMode}`)} {$t('auth.card_title')}</Dialog.Title>
				<Dialog.Description>{$t('auth.card_description')}</Dialog.Description>
			</Dialog.Header>
			{#if globalState.authMode == 'register'}
				<AuthCard
					success={() => toast.success($t('auth.register_success'))}
					failed={() => toast.error($t('auth.register_failed'))}
					id="register"
					data={authForm}
					bind:value={globalState.authMode}
				/>
			{:else if globalState.authMode == 'login'}
				<AuthCard
					success={() => toast.success($t('auth.login_success'))}
					failed={() => toast.error($t('auth.login_failed'))}
					id="login"
					data={authForm}
					bind:value={globalState.authMode}
				/>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/if}
