<script lang="ts">
	import ForecastCard from '@/components/forecast/card.svelte';
	import FeatureCard from '@/components/home/card.svelte';
	import CurrentDayCard from '@/components/measurements/current-day-card.svelte';
	import ClearDay from '@/components/svgs/clear-day.svelte';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Map } from '@/components/ui/map';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import dayjs from 'dayjs';
	import {
		ArrowRight,
		BarChart3,
		Bell,
		CloudRain,
		CloudSun,
		Database,
		Download,
		Gauge,
		Globe,
		MapPin,
		Smartphone,
		Thermometer
	} from 'lucide-svelte';

	const todayStat = {
		date: dayjs(),
		temperature: 24,
		humidity: 68,
		station: 0
	};

	const latestMeasurement = {
		timestamp: dayjs(),
		temperature: 26,
		humidity: 65,
		pressure: 1013,
		rain: 0,
		wind_speed: 5,
		wind_direction: 180,
		created_at: dayjs().toISOString()
	};

	const forecast = {
		time: dayjs(),
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
</script>

<main class="min-h-screen">
	<!-- Hero Section -->
	<section
		class="from-background relative overflow-hidden bg-gradient-to-t to-cyan-100/60 px-6 py-20 sm:py-32 dark:to-blue-950/60"
	>
		<div class="container mx-auto px-4 text-center">
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
	<section class="px-6 py-20">
		<div class="mx-auto max-w-7xl">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
					{$t('home.features.overview_title')}
				</h2>
				<p class="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
					{$t('home.features.overview_description')}
				</p>
			</div>

			<!-- Primary Features Grid -->
			<div class="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
				<FeatureCard>
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

				<FeatureCard>
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

				<FeatureCard>
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

				<FeatureCard>
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

			<!-- Secondary Features Grid -->
			<div class="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<FeatureCard size="sm">
					{#snippet header()}
						<Database class="h-6 w-6 text-emerald-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.history.title')}
						</h3>
						<p class="text-sm text-slate-600 dark:text-slate-400">
							{$t('home.features.history.description')}
						</p>
					{/snippet}
				</FeatureCard>

				<FeatureCard size="sm">
					{#snippet header()}
						<Bell class="h-6 w-6 text-amber-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.alerts.title')}
						</h3>
						<p class="text-sm text-slate-600 dark:text-slate-400">
							{$t('home.features.alerts.description')}
						</p>
					{/snippet}
				</FeatureCard>

				<FeatureCard size="sm">
					{#snippet header()}
						<MapPin class="h-6 w-6 text-rose-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.locations.title')}
						</h3>
						<p class="text-sm text-slate-600 dark:text-slate-400">
							{$t('home.features.locations.description')}
						</p>
					{/snippet}
				</FeatureCard>

				<FeatureCard size="sm">
					{#snippet header()}
						<Smartphone class="h-6 w-6 text-indigo-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.mobile.title')}
						</h3>
						<p class="text-sm text-slate-600 dark:text-slate-400">
							{$t('home.features.mobile.description')}
						</p>
					{/snippet}
				</FeatureCard>

				<FeatureCard size="sm">
					{#snippet header()}
						<Download class="h-6 w-6 text-teal-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.export.title')}
						</h3>
						<p class="text-sm text-slate-600 dark:text-slate-400">
							{$t('home.features.export.description')}
						</p>
					{/snippet}
				</FeatureCard>

				<FeatureCard size="sm">
					{#snippet header()}
						<Globe class="h-6 w-6 text-violet-600" />
					{/snippet}
					{#snippet content()}
						<h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							{$t('home.features.api.title')}
						</h3>
						<p class="text-sm text-slate-600 dark:text-slate-400">
							{$t('home.features.api.description')}
						</p>
					{/snippet}
				</FeatureCard>
			</div>

			<!-- Feature Preview Cards -->
			<div class="flex flex-wrap items-start justify-center gap-8">
				<FeatureCard>
					{#snippet header()}
						<Thermometer class="text-primary h-8 w-8" />
						<h3>{$t('home.features.feature1.title')}</h3>
					{/snippet}
					{#snippet content()}
						<CurrentDayCard {todayStat} {latestMeasurement} isLoading={false} />
					{/snippet}
				</FeatureCard>
				<FeatureCard>
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
				<FeatureCard>
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

	<!-- CTA Section -->
	{#if !globalState.user}
		<section
			class="from-background w-full bg-gradient-to-b to-cyan-50 py-20 md:py-32 lg:py-40 dark:to-cyan-950"
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
		</section>
	{/if}
</main>
