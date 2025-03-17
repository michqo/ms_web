<script lang="ts">
	import { deleteSchema, type DeleteSchema } from '@/shared/schemas';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as AlertDialog from '../alert-dialog';
	import { buttonVariants } from '../button/button.svelte';
	import * as Form from '../form';
	import { Input } from '../input';
	import { toast } from 'svelte-sonner';

  interface Props {
		data: SuperValidated<DeleteSchema>
	}

  const { data }: Props = $props();

	let open = $state(false);

	const form = superForm(data, {
		validators: zodClient(deleteSchema),
		onUpdate: async ({ form: f }) => {
			if (f.valid) {
        toast.success('Successfully deleted account.')
			} else {
				toast.error('Failed to delete account.');
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
