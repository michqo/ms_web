<script lang="ts">
	import { api } from '@/shared';
	import { usernameSchema } from '@/shared/schemas';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { buttonVariants } from '../button/button.svelte';
	import * as Dialog from '../dialog';
	import * as Form from '../form';
	import { Input } from '../input';
	import { t } from '@/translations';
	import { globalState } from '@/shared/runes.svelte';

	let open = $state(false);

	const form = superForm(
		{
			new_username: globalState.user || '',
			current_password: ''
		},
		{
			SPA: true,
			validators: zodClient(usernameSchema),
			onUpdate: async ({ form: f }) => {
				if (f.valid) {
					await api.setUsername(f.data);
					open = false;
				} else {
					console.error('Please fix the errors in the form.');
				}
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}
		>{$t('menu.actions.account.dialog.username_action')}</Dialog.Trigger
	>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{$t('menu.actions.account.dialog.username_action')}</Dialog.Title>
		</Dialog.Header>
		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="new_username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_new_username')}</Form.Label>
						<Input {...props} bind:value={$formData.new_username} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="current_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_current_password')}</Form.Label>
						<Input {...props} type="password" bind:value={$formData.current_password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button>{$t('menu.actions.account.dialog.form_save_changes')}</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
