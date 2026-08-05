<script lang="ts">
	import { globalState, setMockMode } from '@/shared/runes.svelte';
	import type { DeleteSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { FlaskConical, KeyRound, Trash2, User } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import * as Dialog from '../../dialog';
	import DeleteDialog from './delete-dialog.svelte';
	import PasswordDialog from './password-dialog.svelte';
	import UserDialog from './user-dialog.svelte';

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
				<div class="bg-muted/50 flex flex-col gap-2 rounded-lg p-4">
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

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4">
					<User class="size-6" />
					<p class="text-sm font-medium">{$t('menu.actions.account.dialog.username')}</p>
					<UserDialog />
				</div>

				{#if isOAuthOnly}
					<div
						class="border-border/50 bg-muted/20 flex flex-col items-center justify-center space-y-2 rounded-lg border p-4"
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
					<div class="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4">
						<KeyRound class="size-6" />
						<p class="text-sm font-medium">{$t('menu.actions.account.dialog.password')}</p>
						<PasswordDialog />
					</div>
				{/if}
			</div>

			<div class="rounded-lg border p-4">
				<button
					onclick={() => setMockMode(!globalState.mockMode)}
					class="flex w-full items-center justify-between gap-3 text-left transition-colors"
				>
					<div class="flex items-center gap-3">
						<FlaskConical class="text-muted-foreground size-5 shrink-0" />
						<div>
							<p class="text-sm font-medium">Mock data mode</p>
							<p class="text-muted-foreground text-xs">Browse with fake data when API is offline</p>
						</div>
					</div>
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

			<div class="border-destructive/50 bg-destructive/5 space-y-4 rounded-lg border p-4">
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
