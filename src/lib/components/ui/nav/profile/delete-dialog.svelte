<script lang="ts">
	import { deleteSchema, type DeleteSchema } from '@/shared/schemas';
	import { superForm } from 'sveltekit-superforms/client';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as AlertDialog from '../../alert-dialog';
	import { buttonVariants } from '../../button/button.svelte';
	import * as Form from '../../form';
	import { Input } from '../../input';
	import { toast } from 'svelte-sonner';
	import { t } from '@/translations';
	import { getGlobalState } from '@/shared/runes.svelte';
	import { untrack } from 'svelte';
	const globalState = getGlobalState();

	interface Props {
		data: SuperValidated<DeleteSchema>;
	}

	const { data }: Props = $props();

	let open = $state(false);
	const isOAuthOnly = $derived(
		(globalState.user?.social_providers?.length ?? 0) > 0 && !globalState.user?.has_usable_password
	);

	const form = superForm(
		untrack(() => data),
		{
			validators: zod4Client(deleteSchema),
			onUpdate: async ({ form: f }) => {
				if (f.valid) {
					toast.success($t('menu.actions.account.dialog.delete_success'));
					open = false;
					globalState.userOpen = false;
				} else {
					toast.error($t('menu.actions.account.dialog.delete_error'));
				}
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger
		class={buttonVariants({ variant: 'destructive', size: 'sm', class: 'min-h-11' })}
		>{$t('menu.actions.account.dialog.delete_action')}</AlertDialog.Trigger
	>
	<AlertDialog.Content class="backdrop-blur-sm sm:max-w-md">
		<AlertDialog.Header>
			<AlertDialog.Title>{$t('menu.actions.account.dialog.delete_action')}</AlertDialog.Title>
			<AlertDialog.Description>
				{$t('menu.actions.account.dialog.delete_confirm_description')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<form method="POST" use:enhance class="space-y-4">
			{#if isOAuthOnly}
				<input type="hidden" name="is_oauth" value="true" />
			{:else}
				<Form.Field {form} name="current_password">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{$t('menu.actions.account.dialog.form_confirm_password')}</Form.Label>
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
			{/if}
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button"
					>{$t('menu.actions.account.dialog.form_cancel')}</AlertDialog.Cancel
				>
				<AlertDialog.Action
					type="submit"
					formaction="/actions?/delete"
					class={buttonVariants({ variant: 'destructive' })}
					>{$t('menu.actions.account.dialog.delete_action')}</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
