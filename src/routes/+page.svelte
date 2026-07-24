<script lang="ts">
	import { browser } from '$app/environment';
	import ForecastCard from '@/components/forecast/card.svelte';
	import CurrentDayCard from '@/components/measurements/current-day-card.svelte';
	import ClearDay from '@/components/svgs/clear-day.svelte';
	import { Button } from '@/components/ui/button';
	import { Map } from '@/components/ui/map';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import dayjs from 'dayjs';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import {
		ArrowRight,
		Cloud,
		CloudSun,
		ExternalLink,
		Github,
		MapPin,
		Thermometer
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let pageRoot: HTMLElement;

	const date = dayjs();

	const todayStat = {
		date: date,
		temperature: 24,
		humidity: 68,
		station: 0
	};

	const latestMeasurement = {
		timestamp: date,
		temperature: 26,
		humidity: 65,
		pressure: 1013,
		rain: 0,
		wind_speed: 5,
		wind_direction: 180,
		created_at: date.toISOString()
	};

	const forecast = {
		time: date,
		temperature_max: 28,
		temperature_min: 15,
		temperature_mean: 21.5,
		temperature_instant: 22,
		icon: ClearDay,
		windspeed_mean: 5,
		relativehumidity_mean: 65,
		precipitation: 0,
		precipitation_hours: 0,
		sealevelpressure_mean: 1012,
		predictability: 95,
		winddirection: 180,
		uvindex: 5,
		pictocode: 1
	};

	onMount(() => {
		if (!browser) return;

		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			gsap.to('#hero-content', {
				y: 0,
				opacity: 1,
				duration: 0.8,
				ease: 'power2.out'
			});

			gsap.to('.fade-in', {
				scrollTrigger: {
					trigger: '.fade-in',
					start: 'top 85%',
					toggleActions: 'play none none none'
				},
				y: 0,
				opacity: 1,
				stagger: 0.12,
				duration: 0.6,
				ease: 'power2.out'
			});
		}, pageRoot);

		return () => ctx.revert();
	});
</script>

<svelte:head>
	<title>{$t('home.pageTitle')}</title>
	<meta name="description" content={$t('home.hero.subtitle')} />
	<link rel="canonical" href="https://ms.miqal.xyz" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Meteostation" />
	<meta property="og:title" content={$t('home.pageTitle')} />
	<meta property="og:description" content={$t('home.hero.subtitle')} />
	<meta property="og:url" content="https://ms.miqal.xyz" />
	<meta property="og:image" content="https://ms.miqal.xyz/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Meteostation – Your personal weather station" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={$t('home.pageTitle')} />
	<meta name="twitter:description" content={$t('home.hero.subtitle')} />
	<meta name="twitter:image" content="https://ms.miqal.xyz/og.png" />
</svelte:head>

<main bind:this={pageRoot} class="min-h-screen">
	<section
		id="hero"
		class="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 sm:py-36"
	>
		<div class="from-primary/8 via-background to-background absolute inset-0 bg-linear-to-b"></div>
		<div class="absolute inset-0 overflow-hidden">
			<div
				class="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-[100%] bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.18_212_/_0.12)_0%,transparent_70%)]"
			></div>
		</div>

		<div
			id="hero-content"
			class="relative container mx-auto flex max-w-3xl flex-col items-center px-4 text-center"
		>
			<div
				class="border-border/50 bg-background/70 flex flex-col items-center gap-6 rounded-2xl border px-8 py-10 shadow-xs backdrop-blur-md sm:px-12 sm:py-14"
			>
				<span
					class="border-primary/30 bg-primary/5 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-medium"
				>
					<span class="bg-primary/70 h-1.5 w-1.5 animate-pulse rounded-full"></span>
					{$t('home.hero.badge')}
				</span>

				<div
					class="bg-primary/10 ring-primary/20 flex h-20 w-20 items-center justify-center rounded-2xl ring-1"
				>
					<img src="/favicon.png" alt="MS Logo" class="h-12 w-12" />
				</div>

				<div class="flex flex-col gap-3">
					<h1 class="text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
						{@html $t('home.hero.title')}
					</h1>
					<p
						class="text-muted-foreground mx-auto max-w-[560px] text-base leading-relaxed sm:text-lg"
					>
						{$t('home.hero.subtitle')}
					</p>
				</div>

				<div class="flex items-center gap-3">
					<Button variant="default" size="default" class="gap-2" href="/dash">
						{$t('home.hero.cta')}
						<ArrowRight class="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						href="https://github.com/michqo/ms_web"
						target="_blank"
						rel="noopener noreferrer"
						size="default"
						class="gap-2"
					>
						<Github class="h-4 w-4" />
						{$t('home.footer.code')}
						<ExternalLink class="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>

		<div class="from-background absolute right-0 bottom-0 left-0 h-24 bg-linear-to-t"></div>
	</section>

	<section id="features" class="px-6 py-20 sm:py-28">
		<div class="mx-auto max-w-5xl">
			<div class="fade-in mb-14 flex items-center gap-3">
				<span class="text-foreground font-mono text-xs font-semibold tracking-widest uppercase">
					{$t('home.features.overview_title')}
				</span>
				<div class="bg-border h-px flex-1"></div>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div
					class="fade-in border-border/60 bg-card hover:border-primary/40 flex flex-col rounded-xl border p-6 shadow-xs backdrop-blur-xs transition-all hover:shadow-sm sm:p-7"
				>
					<div class="mb-5 flex items-center gap-2.5">
						<Thermometer class="text-primary h-5 w-5" />
						<h3 class="text-sm font-semibold">{$t('home.features.feature1.title')}</h3>
					</div>
					<div class="flex-1">
						<CurrentDayCard {todayStat} {latestMeasurement} isLoading={false} />
					</div>
				</div>

				<div
					class="fade-in border-border/60 bg-card hover:border-primary/40 flex flex-col rounded-xl border p-6 shadow-xs backdrop-blur-xs transition-all hover:shadow-sm sm:p-7"
				>
					<div class="mb-5 flex items-center gap-2.5">
						<MapPin class="text-primary h-5 w-5" />
						<h3 class="text-sm font-semibold">{$t('home.features.feature3.title')}</h3>
					</div>
					<div class="flex flex-1 flex-col">
						<div class="overflow-hidden rounded-lg">
							<Map
								latitude={48.1486}
								longitude={17.1077}
								zoom={13}
								class="border-border/60 h-[220px] rounded-lg border"
								preview
							/>
						</div>
					</div>
				</div>

				<div
					class="fade-in border-border/60 bg-card hover:border-primary/40 flex flex-col rounded-xl border p-6 shadow-xs backdrop-blur-xs transition-all hover:shadow-sm sm:p-7 md:col-span-2"
				>
					<div class="mb-5 flex items-center gap-2.5">
						<CloudSun class="text-primary h-5 w-5" />
						<h3 class="text-sm font-semibold">{$t('home.features.feature2.title')}</h3>
					</div>
					<div class="flex-1">
						<ForecastCard {forecast} stationId={0} measurementPreview={latestMeasurement} />
					</div>
				</div>
			</div>
		</div>
	</section>

	<section
		id="footer"
		class="fade-in border-border/50 mx-auto mt-8 mb-16 max-w-xl border-t pt-20 md:pt-28"
	>
		<div class="flex flex-col items-center gap-4 text-center">
			<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
				{$t('home.register.title')}
			</h2>
			<p class="text-muted-foreground max-w-[420px] text-sm leading-relaxed sm:text-base">
				{$t('home.register.description')}
			</p>
			<div class="mt-4">
				<Button variant="default" size="default" onclick={() => (globalState.authOpen = true)}>
					{$t('auth.register')}
				</Button>
			</div>
		</div>

		<footer class="border-border/50 bg-background/70 mt-16 border-t backdrop-blur-md">
			<div
				class="text-muted-foreground mx-auto flex max-w-7xl items-center justify-between px-4 py-3 font-mono text-xs sm:px-8"
			>
				<a href="/" class="group flex items-center gap-1 font-bold tracking-tight no-underline">
					<span class="text-primary group-hover:text-primary/70 transition-colors">/</span>
					<span class="group-hover:text-primary transition-colors">meteo</span>
				</a>
				<span>&copy; {date.year()} Meteostation. {$t('home.footer.rights')}.</span>
			</div>
		</footer>
	</section>
</main>

<style>
	#hero-content {
		opacity: 0;
		transform: translateY(30px);
	}

	.fade-in {
		opacity: 0;
		transform: translateY(20px);
	}
</style>
