<script lang="ts">
	import ForecastCard from '@/components/forecast/card.svelte';
	import FeatureCard from '@/components/home/card.svelte';
	import CurrentDayCard from '@/components/measurements/current-day-card.svelte';
	import ClearDay from '@/components/svgs/clear-day.svelte';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Map } from '@/components/ui/map';
	import { Separator } from '@/components/ui/separator';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import dayjs from 'dayjs';
	import {
		ArrowRight,
		BarChart3,
		Bell,
		Cloud,
		CloudRain,
		CloudSun,
		Database,
		Download,
		ExternalLink,
		Gauge,
		Github,
		Globe,
		Heart,
		MapPin,
		Smartphone,
		Thermometer
	} from 'lucide-svelte';

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

	// GSAP Animations
	onMount(() => {
		if (browser) {
			gsap.registerPlugin(ScrollTrigger);

			// Hero section animation
			gsap.from('#hero-content', {
				y: 50,
				opacity: 0,
				stagger: 0.2,
				duration: 1,
				ease: 'power2.out'
			});

			// Features heading animation
			gsap.from('#features-heading', {
				scrollTrigger: {
					trigger: '#features-heading',
					start: 'top 80%',
					toggleActions: 'play none none none'
				},
				y: 50,
				opacity: 0,
				duration: 0.8,
				ease: 'power2.out'
			});

			// Primary features animation
			gsap.from('.primary-feature', {
				scrollTrigger: {
					trigger: '.primary-feature',
					start: 'top 80%',
					toggleActions: 'play none none none'
				},
				y: 30,
				opacity: 0,
				stagger: 0.15,
				duration: 0.7,
				ease: 'power2.out'
			});

			// Preview cards animation
			gsap.from('.preview-card', {
				scrollTrigger: {
					trigger: '.preview-card',
					start: 'top 80%',
					toggleActions: 'play none none none'
				},
				scale: 0.95,
				y: 30,
				opacity: 0,
				stagger: 0.2,
				duration: 0.8,
				ease: 'back.out(1.7)'
			});

			// Footer animation
			gsap.from('#footer > *', {
				scrollTrigger: {
					trigger: '#footer',
					start: 'top 80%',
					toggleActions: 'play none none none'
				},
				y: 30,
				opacity: 0,
				stagger: 0.15,
				duration: 0.7,
				ease: 'power2.out'
			});
		}
	});
</script>

<main class="min-h-screen">
	<!-- Hero Section -->
	<section
		id="hero"
		class="from-background relative overflow-hidden bg-gradient-to-t to-cyan-100/60 px-6 py-20 sm:py-32 dark:to-blue-950/50"
	>
		<div id="hero-content" class="container mx-auto px-4 text-center">
			<Badge variant="secondary" class="mb-6 px-4 py-2 text-sm font-medium">
				🌤️ {$t('home.hero.badge')}
			</Badge>
			<h1 class="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
				{@html $t('home.hero.title')}
			</h1>
			<p class="text-muted-foreground mx-auto mt-4 max-w-[700px] text-lg md:text-xl">
				{$t('home.hero.subtitle')}
			</p>
			<div class="mt-6">
				<Button variant="outline" size="lg" href="/dash">
					{$t('home.hero.cta')}
					<ArrowRight class="ml-2 h-5 w-5" />
				</Button>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="px-6 py-20">
		<div class="mx-auto max-w-7xl">
			<div id="features-heading" class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
					{$t('home.features.overview_title')}
				</h2>
				<p class="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
					{$t('home.features.overview_description')}
				</p>
			</div>

			<!-- Primary Features Grid -->
			<div class="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
				<FeatureCard class="primary-feature">
					{#snippet header()}
						<Thermometer class="h-7 w-7 text-red-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.real_time.title')}
						</h3>
						<p class="text-slate-600 dark:text-slate-400">
							{$t('home.features.real_time.description')}
						</p>
					{/snippet}
				</FeatureCard>

				<FeatureCard class="primary-feature">
					{#snippet header()}
						<BarChart3 class="h-7 w-7 text-blue-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.analytics.title')}
						</h3>
						<p class="text-slate-600 dark:text-slate-400">
							{$t('home.features.analytics.description')}
						</p>
					{/snippet}
				</FeatureCard>

				<FeatureCard class="primary-feature">
					{#snippet header()}
						<CloudRain class="h-7 w-7 text-cyan-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.forecast.title')}
						</h3>
						<p class="text-slate-600 dark:text-slate-400">
							{$t('home.features.forecast.description')}
						</p>
					{/snippet}
				</FeatureCard>

				<FeatureCard class="primary-feature">
					{#snippet header()}
						<Gauge class="h-7 w-7 text-purple-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.dashboard.title')}
						</h3>
						<p class="text-slate-600 dark:text-slate-400">
							{$t('home.features.dashboard.description')}
						</p>
					{/snippet}
				</FeatureCard>
			</div>

			<!-- Feature Preview Cards -->
			<div class="flex flex-wrap items-start justify-center gap-8">
				<FeatureCard class="preview-card">
					{#snippet header()}
						<Thermometer class="text-primary h-8 w-8" />
						<h3>{$t('home.features.feature1.title')}</h3>
					{/snippet}
					{#snippet content()}
						<CurrentDayCard {todayStat} {latestMeasurement} isLoading={false} />
					{/snippet}
				</FeatureCard>

				<FeatureCard class="preview-card">
					{#snippet header()}
						<MapPin class="text-primary h-8 w-8" />
						<h3>{$t('home.features.feature3.title')}</h3>
					{/snippet}
					{#snippet content()}
						<div class="w-full max-w-lg overflow-hidden rounded-lg shadow-md">
							<Map latitude={48.1486} longitude={17.1077} zoom={13} class="h-[200px]" preview />
						</div>
					{/snippet}
				</FeatureCard>

				<FeatureCard class="preview-card">
					{#snippet header()}
						<CloudSun class="text-primary h-8 w-8" />
						<h3>{$t('home.features.feature2.title')}</h3>
					{/snippet}
					{#snippet content()}
						<ForecastCard {forecast} stationId={0} measurementPreview={latestMeasurement} />
					{/snippet}
				</FeatureCard>
			</div>
		</div>
	</section>

	<!-- Footer Section -->
	{#if !globalState.user}
		<section
			id="footer"
			class="from-background w-full space-y-10 bg-gradient-to-b to-blue-100/60 pt-20 md:pt-32 lg:pt-40 dark:to-cyan-950/40"
		>
			<div class="container mx-auto px-4 text-center">
				<h2 class="text-3xl font-bold tracking-tighter sm:text-4xl">
					{$t('home.register.title')}
				</h2>
				<p class="text-muted-foreground mx-auto mt-4 max-w-[600px] md:text-lg">
					{$t('home.register.description')}
				</p>
				<div class="mt-6">
					<Button size="lg" onclick={() => (globalState.authOpen = true)}
						>{$t('auth.register')}</Button
					>
				</div>
			</div>

			<div class="flex w-full justify-center">
				<div
					class="border-accent-foreground/30 mt-10 mb-5 flex w-full max-w-2xl flex-col items-center justify-between gap-4 rounded-md border-0 p-8 shadow-xs sm:my-15 sm:items-start sm:border"
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg"
						>
							<Cloud class="h-7 w-7 text-white" />
						</div>
						<div>
							<h3 class="text-2xl font-bold">{$t('menu.app.title')}</h3>
							<p class="text-sm text-slate-600 dark:text-slate-300">
								{$t('menu.app.description')}
							</p>
						</div>
					</div>

					<Button
						variant="ghost"
						href="https://github.com/michqo/ms_web"
						target="_blank"
						class="group w-fit"
					>
						<Github class="h-4 w-4" />
						{$t('home.footer.code')}
						<ExternalLink class="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
					</Button>

					<Separator />

					<!-- Bottom Bar -->
					<div class="container mx-auto px-3 py-3">
						<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
							<div class="flex items-center gap-4 text-sm">
								<span>© {date.year()} {$t('menu.app.title')}. {$t('home.footer.rights')}.</span>
							</div>

							<div class="flex items-center gap-2 text-sm">
								<span>{$t('home.footer.made_with.part1')}</span>
								<Heart class="h-4 w-4 fill-current text-red-500" />
								<span>{$t('home.footer.made_with.part2')}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	{/if}
</main>
