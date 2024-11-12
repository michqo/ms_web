<script lang="ts">
	import { loginSchema, type LoginSchema } from '@/shared/schemas';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Card from './card';
	import * as Form from './form';
	import { Input } from './input';

	interface Props {
		id: 'login' | 'register';
		data: SuperValidated<LoginSchema>;
		success: () => void;
		failed: () => void;
	}

	let { id, data, success, failed }: Props = $props();

	const actionWords = {
		login: 'Log In',
		register: 'Register'
	};
	const actionWord = actionWords[id];

	const form = superForm(data, {
		id: id,
		validators: zodClient(loginSchema),
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				success();
			} else {
				failed();
			}
		},
		onError: () => failed()
	});

	const { form: formData, enhance } = form;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{actionWord} to meteostation</Card.Title>
		<Card.Description>Enter your credentials.</Card.Description>
	</Card.Header>
	<form method="POST" use:enhance>
		<Card.Content>
			<Form.Field {form} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input {...props} bind:value={$formData.username} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Password</Form.Label>
						<Input {...props} type="password" bind:value={$formData.password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
		<Card.Footer>
			<Form.Button>{actionWord}</Form.Button>
		</Card.Footer>
	</form>
</Card.Root>
