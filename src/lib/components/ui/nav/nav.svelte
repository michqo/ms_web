<script module>
	type Route = {
		name: string;
		icon: any;
	};

	export { type Route };
</script>

<script lang="ts">
	import { Button } from '@/components/ui/button';
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import { Github } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Actions from './actions.svelte';
	import I18n from './i18n.svelte';
	import Links from './links.svelte';
	import ThemeToggle from './themetoggle.svelte';
	import { page } from '$app/state';

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	let { authForm, deleteForm }: Props = $props();
</script>

<div
	class="border-border/40 {page.url.pathname == '/'
		? 'dark:bg-primary-foreground/40 bg-cyan-50/60'
		: 'bg-primary-foreground/60'} sticky top-0 z-50 flex w-full justify-center border-b p-4 backdrop-blur-md"
>
	<div class="flex w-full max-w-4xl items-center justify-between">
		<Links />
		<div class="flex items-center gap-x-2">
			<Button variant="ghost" size="icon" href="https://github.com/michqo/ms_web" target="_blank">
				<Github />
			</Button>
			<ThemeToggle />
			<I18n />
			<Actions {authForm} {deleteForm} />
		</div>
	</div>
</div>
