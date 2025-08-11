<script lang="ts">
	import { loginSchema, type LoginSchema } from '@/shared/schemas';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Card from './card';
	import * as Form from './form';
	import { Input } from './input';
	import { Button } from './button';
	import { t } from '@/translations';
	import { globalState } from '@/shared/runes.svelte';
	import { Sparkles } from 'lucide-svelte';

	interface Props {
		id: 'login' | 'register';
		data: SuperValidated<LoginSchema>;
		value: string;
		success: () => void;
		failed: () => void;
	}

	let { id, data, value = $bindable(), success, failed }: Props = $props();

	const actionWords = {
		login: $t('auth.login'),
		register: $t('auth.register')
	};
	const actionWord = actionWords[id];

	const form = superForm(data, {
		id: id,
		validators: zodClient(loginSchema),
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				success();
				globalState.authOpen = false;
			} else {
				failed();
			}
		},
		onError: () => failed()
	});

	const { form: formData, enhance } = form;
</script>

{#snippet switchButton()}
	<Button
		variant={globalState.isMobile.value ? 'outline' : 'secondary'}
		class="w-full cursor-pointer"
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
	<Card.Header>
		<Card.Title
			class="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-300"
			>{actionWord} {$t('auth.card_title')}</Card.Title
		>
		<Card.Description>{$t('auth.card_description')}</Card.Description>
		{#if !globalState.isMobile.value}
			<Card.Action>
				{@render switchButton()}
			</Card.Action>
		{/if}
	</Card.Header>
	<form method="POST" action="/actions?/auth" use:enhance>
		<Card.Content class="space-y-6">
			<Form.Field {form} name="username">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('auth.username')}</Form.Label>
						<Input {...props} bind:value={$formData.username} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('auth.password')}</Form.Label>
						<Input {...props} type="password" bind:value={$formData.password} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
		<Card.Footer class="mt-8 flex flex-col items-center gap-2">
			<Form.Button class="w-full">{actionWord}</Form.Button>
			{#if globalState.isMobile.value}
				{@render switchButton()}
			{/if}
		</Card.Footer>
	</form>
</Card.Root>
