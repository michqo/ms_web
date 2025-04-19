<script lang="ts">
	import { deleteSchema, type DeleteSchema } from '@/shared/schemas';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as AlertDialog from '../alert-dialog';
	import { buttonVariants } from '../button/button.svelte';
	import * as Form from '../form';
	import { Input } from '../input';
	import { toast } from 'svelte-sonner';
	import { t } from '@/translations';

	interface Props {
		data: SuperValidated<DeleteSchema>;
	}

	const { data }: Props = $props();

	let open = $state(false);

	const form = superForm(data, {
		validators: zodClient(deleteSchema),
		onUpdate: async ({ form: f }) => {
			if (f.valid) {
				toast.success('Successfully deleted account.');
			} else {
				toast.error('Failed to delete account.');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}
		>{$t('menu.actions.account.dialog.delete_action')}</AlertDialog.Trigger
	>
	<AlertDialog.Content class="sm:max-w-md">
		<AlertDialog.Header>
			<AlertDialog.Title>{$t('menu.actions.account.dialog.delete_action')}</AlertDialog.Title>
		</AlertDialog.Header>
		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="current_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_confirm_password')}</Form.Label>
						<Input {...props} type="password" bind:value={$formData.current_password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button"
					>{$t('menu.actions.account.dialog.form_cancel')}</AlertDialog.Cancel
				>
				<AlertDialog.Action
					type="submit"
					formaction="?/delete"
					class={buttonVariants({ variant: 'destructive' })}
					>{$t('menu.actions.account.dialog.delete_action')}</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
