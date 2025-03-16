<script lang="ts">
	import { api } from '@/shared';
	import { deleteSchema } from '@/shared/schemas';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import * as AlertDialog from '../alert-dialog';
	import { buttonVariants } from '../button/button.svelte';
	import * as Form from '../form';
	import { Input } from '../input';
	import { goto } from '$app/navigation';

	let open = $state(false);

	const form = superForm(defaults(zod(deleteSchema)), {
		SPA: true,
		validators: zodClient(deleteSchema),
		onUpdate: async ({ form: f }) => {
			if (f.valid) {
				await api.deleteAccount(f.data);
        goto('/logout');
				open = false;
			} else {
				console.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}
		>Delete Account</AlertDialog.Trigger
	>
	<AlertDialog.Content class="sm:max-w-md">
		<AlertDialog.Header>
			<AlertDialog.Title>Delete account</AlertDialog.Title>
			<AlertDialog.Description>Enter your current password.</AlertDialog.Description>
		</AlertDialog.Header>
		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="current_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Current Password</Form.Label>
						<Input {...props} type="password" bind:value={$formData.current_password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="submit" class={buttonVariants({ variant: 'destructive' })}
					>Delete</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
