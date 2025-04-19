<script lang="ts">
	import { User } from 'lucide-svelte';
	import * as Dialog from '../dialog';
	import UserDialog from './user-dialog.svelte';
	import PasswordDialog from './password-dialog.svelte';
	import DeleteDialog from './delete-dialog.svelte';
	import type { DeleteSchema } from '@/shared/schemas';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { t } from '@/translations';
	import { globalState } from '@/shared/runes.svelte';

	interface Props {
		data: SuperValidated<DeleteSchema>;
		open: boolean;
	}

	let { data, open = $bindable() }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{$t('menu.actions.account.title')}</Dialog.Title>
			<Dialog.Description>{$t('menu.actions.account.dialog.description')}</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-3">
			<div class="flex items-center justify-between">
				<div class="flex flex-col">
					<span class="text-sm">{$t('menu.actions.account.dialog.username')}</span>
					<span class="text-muted-foreground text-sm">{globalState.user}</span>
				</div>
				<UserDialog />
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm">{$t('menu.actions.account.dialog.password')}</span>
				<PasswordDialog />
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm">{$t('menu.actions.account.dialog.delete')}</span>
				<DeleteDialog {data} />
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
