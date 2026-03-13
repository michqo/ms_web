<script lang="ts">
	import { browser } from '$app/environment';
	import ForecastCard from '@/components/forecast/card.svelte';
	import CurrentDayCard from '@/components/measurements/current-day-card.svelte';
	import ClearDay from '@/components/svgs/clear-day.svelte';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import { Map } from '@/components/ui/map';
	import { Separator } from '@/components/ui/separator';
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
		Heart,
		Linkedin,
		Mail,
		MapPin,
		Thermometer
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

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

	const techStack = [
		{
			name: 'SvelteKit',
			description: $t('home.techStack.sveltekit.description'),
			icon: '/svelte.svg',
			color: 'from-orange-500/20 to-red-500/20'
		},
		{
			name: 'TypeScript',
			description: $t('home.techStack.typescript.description'),
			icon: '/typescript.svg',
			color: 'from-blue-500/20 to-blue-600/20'
		},
		{
			name: 'Tailwind CSS',
			description: $t('home.techStack.tailwind.description'),
			icon: '/tailwind.svg',
			color: 'from-cyan-500/20 to-teal-500/20'
		}
	];

	// GSAP Animations
	onMount(() => {
		if (browser) {
			gsap.registerPlugin(ScrollTrigger);

			// Hero section animation
			gsap.from('#hero-content > *', {
				y: 60,
				opacity: 0,
				stagger: 0.15,
				duration: 1,
				ease: 'power3.out'
			});

			// Tech stack animation
			gsap.from('.tech-card', {
				scrollTrigger: {
					trigger: '#tech-stack',
					start: 'top 80%',
					toggleActions: 'play none none none'
				},
				y: 40,
				opacity: 0,
				stagger: 0.1,
				duration: 0.7,
				ease: 'power2.out'
			});

			// Demo section animation
			gsap.from('#demo-heading', {
				scrollTrigger: {
					trigger: '#demo-heading',
					start: 'top 80%',
					toggleActions: 'play none none none'
				},
				y: 40,
				opacity: 0,
				duration: 0.8,
				ease: 'power2.out'
			});

			// Preview cards animation
			gsap.from('.preview-card', {
				scrollTrigger: {
					trigger: '.preview-card',
					start: 'top 85%',
					toggleActions: 'play none none none'
				},
				scale: 0.95,
				y: 40,
				opacity: 0,
				stagger: 0.15,
				duration: 0.8,
				ease: 'back.out(1.4)'
			});

			// Footer animation
			gsap.from('#footer-content > *', {
				scrollTrigger: {
					trigger: '#footer',
					start: 'top 85%',
					toggleActions: 'play none none none'
				},
				y: 30,
				opacity: 0,
				stagger: 0.1,
				duration: 0.7,
				ease: 'power2.out'
			});
		}
	});
</script>

<svelte:head>
	<title>{$t('home.pageTitle')}</title>
</svelte:head>

<main class="dark min-h-screen bg-background text-foreground">
	<!-- Hero Section -->
	<section id="hero" class="relative overflow-hidden px-6 py-24 sm:py-32 lg:py-40">
		<!-- Background gradient effects -->
		<div
			class="pointer-events-none absolute inset-0 overflow-hidden"
			aria-hidden="true"
		>
			<div
				class="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl"
			></div>
			<div
				class="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl"
			></div>
		</div>

		<div
			id="hero-content"
			class="container relative z-10 mx-auto flex flex-col items-center px-4 text-center"
		>
			<Badge variant="secondary" class="mb-6 px-4 py-1.5 text-sm font-medium">
				{$t('home.hero.badge')}
			</Badge>

			<h1
				class="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
			>
				{@html $t('home.hero.title')}
			</h1>

			<p class="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
				{$t('home.hero.subtitle')}
			</p>

			<p class="mt-4 text-sm text-muted-foreground">
				{$t('home.about.builtBy')}
			</p>

			<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
				<Button size="lg" href="/dash" class="gap-2">
					{$t('home.hero.cta')}
					<ArrowRight class="h-4 w-4" />
				</Button>
				<Button variant="outline" size="lg" href="https://github.com/michqo/ms_web" target="_blank" class="gap-2">
					<Github class="h-4 w-4" />
					{$t('home.hero.viewSource')}
				</Button>
			</div>
		</div>
	</section>

	<!-- Tech Stack Section -->
	<section id="tech-stack" class="border-y border-border bg-card/30 px-6 py-20">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
					{$t('home.techStack.title')}
				</h2>
				<p class="mx-auto max-w-2xl text-muted-foreground">
					{$t('home.techStack.description')}
				</p>
			</div>

			<div class="grid gap-6 sm:grid-cols-3">
				{#each techStack as tech}
					<Card.Root class="tech-card group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
						<div
							class="absolute inset-0 bg-gradient-to-br {tech.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
						<Card.Content class="relative flex flex-col items-center p-8 text-center">
							<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
								<img src={tech.icon} alt={tech.name} class="h-10 w-10" />
							</div>
							<h3 class="mb-2 text-xl font-semibold">{tech.name}</h3>
							<p class="text-sm text-muted-foreground">{tech.description}</p>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	</section>

	<!-- Live Demo Section -->
	<section id="demo" class="px-6 py-20 lg:py-28">
		<div class="mx-auto max-w-7xl">
			<div id="demo-heading" class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
					{$t('home.demo.title')}
				</h2>
				<p class="mx-auto max-w-2xl text-muted-foreground">
					{$t('home.demo.description')}
				</p>
			</div>

			<!-- Demo Cards Grid -->
			<div class="grid gap-8 lg:grid-cols-3">
				<!-- Real-time Measurements Card -->
				<Card.Root class="preview-card group overflow-hidden border-border bg-card">
					<Card.Header class="border-b border-border bg-secondary/30 px-6 py-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
								<Thermometer class="h-5 w-5 text-primary" />
							</div>
							<div>
								<Card.Title class="text-base font-semibold">{$t('home.features.feature1.title')}</Card.Title>
								<Card.Description class="text-xs">{$t('home.features.feature1.description')}</Card.Description>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="p-6">
						<CurrentDayCard {todayStat} {latestMeasurement} isLoading={false} />
					</Card.Content>
				</Card.Root>

				<!-- Interactive Map Card -->
				<Card.Root class="preview-card group overflow-hidden border-border bg-card">
					<Card.Header class="border-b border-border bg-secondary/30 px-6 py-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
								<MapPin class="h-5 w-5 text-accent" />
							</div>
							<div>
								<Card.Title class="text-base font-semibold">{$t('home.features.feature3.title')}</Card.Title>
								<Card.Description class="text-xs">{$t('home.features.feature3.description')}</Card.Description>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="p-6">
						<div class="overflow-hidden rounded-lg ring-1 ring-border">
							<Map latitude={48.1486} longitude={17.1077} zoom={13} class="h-[250px]" preview />
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Weather Forecast Card -->
				<Card.Root class="preview-card group overflow-hidden border-border bg-card">
					<Card.Header class="border-b border-border bg-secondary/30 px-6 py-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
								<CloudSun class="h-5 w-5 text-primary" />
							</div>
							<div>
								<Card.Title class="text-base font-semibold">{$t('home.features.feature2.title')}</Card.Title>
								<Card.Description class="text-xs">{$t('home.features.feature2.description')}</Card.Description>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="p-6">
						<ForecastCard {forecast} stationId={0} measurementPreview={latestMeasurement} />
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="border-t border-border bg-card/30 px-6 py-20">
		<div class="container mx-auto max-w-4xl text-center">
			<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
				{$t('home.register.title')}
			</h2>
			<p class="mx-auto mb-8 max-w-xl text-muted-foreground">
				{$t('home.register.description')}
			</p>
			<Button size="lg" onclick={() => (globalState.authOpen = true)}>
				{$t('auth.register')}
			</Button>
		</div>
	</section>

	<!-- Footer Section -->
	<footer id="footer" class="border-t border-border px-6 py-16">
		<div id="footer-content" class="mx-auto max-w-6xl">
			<div class="flex flex-col items-center gap-8">
				<!-- Logo & Description -->
				<div class="flex items-center gap-3">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg"
					>
						<Cloud class="h-7 w-7 text-primary-foreground" />
					</div>
					<div>
						<h3 class="text-xl font-bold">{$t('menu.app.title')}</h3>
						<p class="text-sm text-muted-foreground">{$t('menu.app.description')}</p>
					</div>
				</div>

				<!-- Social Links -->
				<div class="flex items-center gap-4">
					<Button variant="ghost" size="icon" href="https://github.com/michqo/ms_web" target="_blank">
						<Github class="h-5 w-5" />
						<span class="sr-only">GitHub</span>
					</Button>
					<Button variant="ghost" size="icon" href="https://linkedin.com" target="_blank">
						<Linkedin class="h-5 w-5" />
						<span class="sr-only">LinkedIn</span>
					</Button>
					<Button variant="ghost" size="icon" href="mailto:contact@example.com">
						<Mail class="h-5 w-5" />
						<span class="sr-only">Email</span>
					</Button>
				</div>

				<Separator class="w-full max-w-md" />

				<!-- Bottom Bar -->
				<div class="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:gap-8">
					<span>&copy; {date.year()} {$t('menu.app.title')}. {$t('home.footer.rights')}.</span>
					<div class="flex items-center gap-2">
						<span>{$t('home.footer.made_with.part1')}</span>
						<Heart class="h-4 w-4 fill-current text-red-500" />
						<span>{$t('home.footer.made_with.part2')}</span>
					</div>
				</div>
			</div>
		</div>
	</footer>
</main>
