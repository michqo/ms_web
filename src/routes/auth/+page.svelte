<script lang="ts">
	import { page } from '$app/state';
	import * as Tabs from '@/components/ui/tabs/index';
	import type { PageData } from './$types';
	import AuthCard from '@/components/ui/AuthCard.svelte';
	import { toast } from 'svelte-sonner';
	import { t } from '@/translations';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const forParam = $derived(page.url.searchParams.get('for'));
</script>

<main class="grid h-screen items-center justify-center">
	<Tabs.Root value={forParam ? forParam : 'register'} class="w-[400px]">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="register">{$t('auth.tab_register')}</Tabs.Trigger>
			<Tabs.Trigger value="login">{$t('auth.tab_login')}</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="register">
			<AuthCard
				success={() => toast.success($t('auth.register_success'))}
				failed={() => toast.error($t('auth.register_failed'))}
				id="register"
				data={data.form}
			/>
		</Tabs.Content>
		<Tabs.Content value="login">
			<AuthCard
				success={() => toast.success($t('auth.login_success'))}
				failed={() => toast.error($t('auth.login_failed'))}
				id="login"
				data={data.form}
			/>
		</Tabs.Content>
	</Tabs.Root>
</main>
