<script module>
	type Route = {
		name: string;
		icon: any;
	};

	export { type Route };
</script>

<script lang="ts">
	import type { DeleteSchema, LoginSchema } from '@/shared/schemas';
	import { t } from '@/translations';
	import { get } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';
	import Actions from './actions.svelte';
	import Loading from '@/components/Loading.svelte';
	import I18n from './i18n.svelte';
	import Links from './links.svelte';
	import StationSelector from './station-selector.svelte';
	import ThemeToggle from './themetoggle.svelte';
	import { cn } from '@/utils';

	interface Props {
		authForm: SuperValidated<LoginSchema>;
		deleteForm: SuperValidated<DeleteSchema>;
	}

	let { authForm, deleteForm }: Props = $props();

	let scrolled = $state(false);
	const FLOAT_IN = 80;
	const FLOAT_OUT = 40;

	$effect(() => {
		const update = () => {
			const y = window.scrollY;
			scrolled = scrolled ? y >= FLOAT_OUT : y > FLOAT_IN;
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		return () => window.removeEventListener('scroll', update);
	});
</script>

<div class="sticky top-0 z-50 w-full">
	<div
		class={cn(
			'mx-auto transition-all duration-500 ease-out',
			scrolled ? 'w-full max-w-4xl px-4 pt-2' : 'w-full max-w-[100%] px-0 pt-0'
		)}
	>
		<header
			class={cn(
				'border-border/50 bg-background/80 relative backdrop-blur-md transition-all duration-500 ease-out',
				scrolled
					? 'rounded-xl border shadow-lg shadow-black/8 dark:shadow-black/20'
					: 'rounded-none border-b'
			)}
		>
			<div
				class="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-x-6 px-4 py-3 font-mono text-sm sm:px-6"
			>
				<a
					href="/"
					class="group flex items-center gap-1 text-sm font-bold tracking-tight no-underline"
				>
					<span class="text-primary group-hover:text-primary/70 transition-colors">/</span>
					<span class="text-foreground group-hover:text-primary transition-colors">
						{get(t)('menu.app.title')}
					</span>
				</a>

				<div class="flex items-center justify-center gap-2">
					<StationSelector />
					<Links />
				</div>

				<div class="flex items-center gap-2">
					<ThemeToggle />
					<I18n />
					<Actions {authForm} {deleteForm} />
				</div>
			</div>

			<Loading />
		</header>
	</div>
</div>
