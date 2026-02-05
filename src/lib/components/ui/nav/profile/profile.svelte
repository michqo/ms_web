<script lang="ts">
	import { globalState } from '@/shared/runes.svelte';
	import type { DeleteSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { KeyRound, Trash2, User } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import * as Dialog from '../../dialog';
	import DeleteDialog from './delete-dialog.svelte';
	import PasswordDialog from './password-dialog.svelte';
	import UserDialog from './user-dialog.svelte';

	interface Props {
		data: SuperValidated<DeleteSchema>;
	}

	const { data }: Props = $props();
</script>

<Dialog.Root bind:open={globalState.userOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{$t('menu.actions.account.title')}</Dialog.Title>
			<Dialog.Description>{$t('menu.actions.account.dialog.description')}</Dialog.Description>
		</Dialog.Header>
		<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
			<div class="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4">
				<User class="size-6" />
				<p class="text-sm font-medium">{$t('menu.actions.account.dialog.username')}</p>
				<UserDialog />
			</div>
			<div class="flex flex-col items-center justify-center space-y-2 rounded-lg border p-4">
				<KeyRound class="size-6" />
				<p class="text-sm font-medium">{$t('menu.actions.account.dialog.password')}</p>
				<PasswordDialog />
			</div>
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
	</Dialog.Content>
</Dialog.Root>
