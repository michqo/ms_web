<script lang="ts">
	import { getApi } from '@/shared/runes.svelte';
	import { passwordSchema } from '@/shared/schemas';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { buttonVariants } from '../../button/button.svelte';
	import * as Dialog from '../../dialog';
	import * as Form from '../../form';
	import { Input } from '../../input';
	import { t } from '@/translations';
	import { getGlobalState } from '@/shared/runes.svelte';
	import { toast } from 'svelte-sonner';
	const globalState = getGlobalState();

	const api = getApi();

	let open = $state(false);

	const form = superForm(
		{ current_password: '', new_password: '', confirm_password: '' },
		{
			SPA: true,
			validators: zod4Client(passwordSchema),
			onUpdate: async ({ form: f }) => {
				if (f.valid) {
					const { current_password, new_password } = f.data;
					try {
						await api.setPassword({ current_password, new_password });
					} catch {
						toast.error($t('menu.actions.account.dialog.password_error'));
						return;
					}
					open = false;
					globalState.userOpen = false;
					toast.success($t('menu.actions.account.dialog.password_success'));
				} else {
					toast.error($t('menu.actions.account.dialog.password_error'));
				}
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm', class: 'min-h-11' })}
		>{$t('menu.actions.account.dialog.password_action')}</Dialog.Trigger
	>
	<Dialog.Content class="backdrop-blur-sm sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{$t('menu.actions.account.dialog.password_action')}</Dialog.Title>
			<Dialog.Description>
				{$t('menu.actions.account.dialog.password_description')}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="current_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_current_password')}</Form.Label>
						<Input
							{...props}
							class="min-h-11"
							autocomplete="current-password"
							required
							type="password"
							bind:value={$formData.current_password}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="new_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_new_password')}</Form.Label>
						<Input
							{...props}
							class="min-h-11"
							autocomplete="new-password"
							required
							type="password"
							bind:value={$formData.new_password}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="confirm_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('menu.actions.account.dialog.form_confirm_new_password')}</Form.Label>
						<Input
							{...props}
							class="min-h-11"
							autocomplete="new-password"
							required
							type="password"
							bind:value={$formData.confirm_password}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button class="min-h-11"
					>{$t('menu.actions.account.dialog.form_save_changes')}</Form.Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
