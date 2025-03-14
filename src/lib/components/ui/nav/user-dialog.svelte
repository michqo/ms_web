<script lang="ts">
	import { api } from '@/shared';
	import { usernameSchema } from '@/shared/schemas';
	import { User } from 'lucide-svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import * as Dialog from '../dialog';
	import * as Form from '../form';
	import { Input } from '../input';
	import Button from '../button/button.svelte';

	const { user }: { user?: string } = $props();

	let open = $state(false);

	const form = superForm(defaults(zod(usernameSchema)), {
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
	});

	const { form: formData, enhance } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
    <Button>Change Username</Button>
  </Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Change username</Dialog.Title>
		</Dialog.Header>
		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="new_username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>New Username</Form.Label>
						<Input {...props} bind:value={$formData.new_username} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="current_password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Current Password</Form.Label>
						<Input {...props} type="password" bind:value={$formData.current_password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button>Save changes</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
