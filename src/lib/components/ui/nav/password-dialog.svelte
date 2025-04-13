<script lang="ts">
	import { api } from '@/shared';
	import { passwordSchema } from '@/shared/schemas';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { buttonVariants } from '../button/button.svelte';
	import * as Dialog from '../dialog';
	import * as Form from '../form';
	import { Input } from '../input';
	import { t } from '@/translations';

	let open = $state(false);

	const form = superForm(defaults(zod(passwordSchema)), {
		SPA: true,
		validators: zodClient(passwordSchema),
		onUpdate: async ({ form: f }) => {
			if (f.valid) {
				const { current_password, new_password } = f.data;
				await api.setPassword({ current_password, new_password });
				open = false;
			} else {
				console.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>{$t('menu.actions.account.dialog.password_action')}</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{$t('menu.actions.account.dialog.password_action')}</Dialog.Title>
		</Dialog.Header>
		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="current_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_current_password')}</Form.Label>
						<Input {...props} type="password" bind:value={$formData.current_password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="new_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_new_password')}</Form.Label>
						<Input {...props} type="password" bind:value={$formData.new_password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="confirm_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_confirm_new_password')}</Form.Label>
						<Input {...props} type="password" bind:value={$formData.confirm_password} />
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
