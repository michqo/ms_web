<script lang="ts">
	import { loginSchema, type LoginSchema } from '@/shared/schemas';
	import { superForm } from 'sveltekit-superforms/client';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Card from './card';
	import * as Form from './form';
	import { Input } from './input';
	import { Button } from './button';
	import { t } from '@/translations';
	import { getGlobalState } from '@/shared/runes.svelte';
	import OAuthButtons from './OAuthButtons.svelte';
	import { untrack } from 'svelte';
	const globalState = getGlobalState();

	interface Props {
		id: 'login' | 'register';
		data: SuperValidated<LoginSchema>;
		value: 'login' | 'register';
		success: () => void;
		failed: () => void;
	}

	let { id, data, value = $bindable(), success, failed }: Props = $props();

	const actionWord = $derived($t(`auth.${id}`));

	const form = superForm(
		untrack(() => data),
		{
			id: untrack(() => id),
			validators: zod4Client(loginSchema),
			onUpdate: ({ form: f }) => {
				if (f.valid) {
					success();
					globalState.authOpen = false;
				} else {
					failed();
				}
			},
			onError: () => failed()
		}
	);

	const { form: formData, enhance, submitting, errors } = form;
</script>

{#snippet switchButton()}
	<Button
		variant={globalState.isMobile.value ? 'outline' : 'secondary'}
		class="min-h-11 w-full cursor-pointer"
		onclick={() => {
			if (id === 'login') {
				value = 'register';
			} else {
				value = 'login';
			}
		}}
	>
		{id === 'login' ? $t('auth.register') : $t('auth.login')}
	</Button>
{/snippet}

<Card.Root class="border-0 bg-transparent shadow-none">
	<OAuthButtons />
	<form method="POST" action="/actions?/auth" use:enhance>
		<Card.Content class="space-y-4 px-0">
			<Form.Field {form} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('auth.username')}</Form.Label>
						<Input
							{...props}
							autocomplete="username"
							required
							bind:value={$formData.username}
							class="min-h-11"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('auth.password')}</Form.Label>
						<Input
							{...props}
							type="password"
							autocomplete={id === 'login' ? 'current-password' : 'new-password'}
							required
							bind:value={$formData.password}
							class="min-h-11"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
		{#if $errors._errors?.length}<p class="weather-error" role="alert">
				{$errors._errors.join(' ')}
			</p>{/if}
		<Card.Footer class="mt-4 flex flex-col items-center gap-2 px-0">
			<Form.Button class="min-h-11 w-full" disabled={$submitting}>
				{#if $submitting}
					<div
						class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					></div>
				{/if}
				{actionWord}
			</Form.Button>
			{@render switchButton()}
		</Card.Footer>
	</form>
</Card.Root>
