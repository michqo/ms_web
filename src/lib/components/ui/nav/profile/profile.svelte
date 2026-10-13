<script lang="ts">
	import { getGlobalState } from '@/shared/runes.svelte';
	import type { DeleteSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { KeyRound, Trash2, User } from '@lucide/svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import * as Dialog from '../../dialog';
	import DeleteDialog from './delete-dialog.svelte';
	import PasswordDialog from './password-dialog.svelte';
	import UserDialog from './user-dialog.svelte';
	const globalState = getGlobalState();

	interface Props {
		data: SuperValidated<DeleteSchema>;
	}

	const { data }: Props = $props();

	const currentUser = $derived(typeof globalState.user === 'object' ? globalState.user : undefined);
	const isOAuthOnly = $derived(
		(currentUser?.social_providers?.length ?? 0) > 0 && !currentUser?.has_usable_password
	);
	const hasPassword = $derived(currentUser?.has_usable_password ?? false);

	function providerLabel(provider: string): string {
		if (provider.includes('google')) return $t('auth.oauth_google');
		if (provider.includes('github')) return $t('auth.oauth_github');
		return provider;
	}
</script>

<Dialog.Root bind:open={globalState.userOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{$t('menu.actions.account.title')}</Dialog.Title>
			<Dialog.Description>{$t('menu.actions.account.dialog.description')}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			{#if currentUser}
				<div class="flex flex-col gap-2 border-b py-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-semibold">{currentUser.username}</span>
						{#if currentUser.email}
							<span class="text-muted-foreground text-xs">{currentUser.email}</span>
						{/if}
					</div>
					{#if (currentUser.social_providers?.length ?? 0) > 0}
						<div class="border-border/50 flex flex-wrap items-center gap-2 border-t pt-2">
							<span class="text-muted-foreground text-[11px]"
								>{$t('menu.actions.account.dialog.provider_label')}</span
							>
							{#each currentUser.social_providers as provider}
								<span
									class="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
								>
									{providerLabel(provider)}
								</span>
							{/each}
						</div>
					{:else}
						<div class="border-border/50 flex items-center gap-2 border-t pt-2">
							<span class="text-muted-foreground text-[11px]"
								>{$t('menu.actions.account.dialog.password_account')}</span
							>
						</div>
					{/if}
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-3">
				<div class="flex flex-wrap items-center justify-between gap-3 border-b py-3">
					<User class="size-6" />
					<p class="text-sm font-medium">{$t('menu.actions.account.dialog.username')}</p>
					<UserDialog />
				</div>

				{#if isOAuthOnly}
					<div
						class="border-border/50 bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-b py-3"
					>
						<KeyRound class="text-muted-foreground size-6" />
						<p class="text-muted-foreground text-sm font-medium">
							{$t('menu.actions.account.dialog.password')}
						</p>
						<p class="text-muted-foreground text-[11px]">
							{$t('menu.actions.account.dialog.oauth_no_password')}
						</p>
					</div>
				{:else}
					<div class="flex flex-wrap items-center justify-between gap-3 border-b py-3">
						<KeyRound class="size-6" />
						<p class="text-sm font-medium">{$t('menu.actions.account.dialog.password')}</p>
						<PasswordDialog />
					</div>
				{/if}
			</div>

			<div class="space-y-3 border-t pt-4">
				<div class="space-y-1">
					<h3 class="text-destructive font-semibold">
						{$t('menu.actions.account.dialog.delete_title')}
					</h3>
					<p class="text-destructive/80 text-sm">
						{$t('menu.actions.account.dialog.delete_description')}
					</p>
				</div>
				<DeleteDialog {data} />
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
