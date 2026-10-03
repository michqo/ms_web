<script lang="ts">
	import ForecastCard from '@/components/forecast/card.svelte';
	import CurrentDayCard from '@/components/measurements/current-day-card.svelte';
	import ClearDay from '@/components/svgs/clear-day.svelte';
	import { Button } from '@/components/ui/button';
	import { Map } from '@/components/ui/map';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import dayjs from 'dayjs';
	import {
		ArrowRight,
		Cloud,
		CloudSun,
		ExternalLink,
		Github,
		MapPin,
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

<div class="min-h-screen">
	<section id="hero" class="mx-auto flex max-w-7xl flex-col px-4 py-12 sm:px-8 sm:py-16">
		<div id="hero-content" class="flex max-w-3xl flex-col">
			<div class="flex flex-col items-start gap-6">
				<div class="bg-accent flex size-14 items-center justify-center rounded-xl">
					<img src="/favicon.png" alt="MS Logo" class="size-9" />
				</div>

				<div class="flex flex-col gap-3">
					<h1 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
						{@html $t('home.hero.title')}
					</h1>
					<p class="text-muted-foreground max-w-xl text-base leading-relaxed">
						{$t('home.hero.subtitle')}
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<Button variant="default" size="default" class="min-h-11 gap-2" href="/dash">
						{$t('home.hero.cta')}
						<ArrowRight class="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						href="https://github.com/michqo/ms_web"
						target="_blank"
						rel="noopener noreferrer"
						size="default"
						class="min-h-11 gap-2"
					>
						<Github class="h-4 w-4" />
						{$t('home.footer.code')}
						<ExternalLink class="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	</section>

	<section id="features" class="px-4 py-8 sm:px-8 sm:py-12">
		<div class="mx-auto max-w-7xl">
			<div class="mb-6 flex items-center gap-3">
				<h2 class="text-foreground font-mono text-xs font-semibold tracking-widest uppercase">
					{$t('home.features.overview_title')}
				</h2>
				<div class="bg-border h-px flex-1"></div>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="border-border bg-card flex flex-col rounded-xl border p-5 sm:p-6">
					<div class="mb-5 flex items-center gap-2.5">
						<Thermometer class="text-primary h-5 w-5" />
						<h3 class="text-sm font-semibold">{$t('home.features.feature1.title')}</h3>
					</div>
					<div class="flex-1">
						<CurrentDayCard {todayStat} {latestMeasurement} isLoading={false} />
					</div>
				</div>

				<div class="border-border bg-card flex flex-col rounded-xl border p-5 sm:p-6">
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
								class="border-border/50 h-[220px] rounded-lg border"
								preview
							/>
						</div>
					</div>
				</div>

				<div class="border-border bg-card flex flex-col rounded-xl border p-5 sm:p-6 md:col-span-2">
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

	<section id="footer" class="mx-auto mt-8 mb-12 max-w-7xl px-4 pt-8 sm:px-8">
		<div class="flex flex-col items-start gap-4">
			<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
				{$t('home.register.title')}
			</h2>
			<p class="text-muted-foreground max-w-[420px] text-sm leading-relaxed sm:text-base">
				{$t('home.register.description')}
			</p>
			<div class="mt-4">
				<Button
					variant="default"
					size="default"
					class="min-h-11"
					onclick={() => (globalState.authOpen = true)}
				>
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
</div>
