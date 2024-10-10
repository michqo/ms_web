<script lang="ts">
  import { loginSchema, type LoginSchema } from '@/shared/schemas';
  import { createEventDispatcher } from 'svelte';
  import { superForm, type SuperValidated } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import * as Card from './card';
  import * as Form from './form';
  import { Input } from './input';

  export let id: 'login' | 'register';
  export let data: SuperValidated<LoginSchema>;

  const actionWords = {
    login: 'Log In',
    register: 'Register'
  };
  const actionWord = actionWords[id];

  const dispatch = createEventDispatcher();

  const form = superForm(data, {
    id: id,
    validators: zodClient(loginSchema),
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        dispatch('success');
      } else {
        dispatch('failed');
      }
    },
    onError: () => dispatch('failed')
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
        <Form.Control let:attrs>
          <Form.Label>Username</Form.Label>
          <Input {...attrs} bind:value={$formData.username} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="password">
        <Form.Control let:attrs>
          <Form.Label>Password</Form.Label>
          <Input {...attrs} type="password" bind:value={$formData.password} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </Card.Content>
    <Card.Footer>
      <Form.Button>{actionWord}</Form.Button>
    </Card.Footer>
  </form>
</Card.Root>
