<script lang="ts">
	import ForecastCard from '@/components/forecast/card.svelte';
	import HomeCard from '@/components/home/card.svelte';
	import CurrentDayCard from '@/components/measurements/current-day-card.svelte';
	import ClearDay from '@/components/svgs/clear-day.svelte';
	import { Button } from '@/components/ui/button';
	import { Map } from '@/components/ui/map';
	import { globalState } from '@/shared/runes.svelte';
	import { t } from '@/translations';
	import dayjs from 'dayjs';
	import { ArrowRight, CloudSun, MapPin, Thermometer } from 'lucide-svelte';

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

<main class="flex flex-1 flex-col">
	<!-- Hero Section -->
	<section
		class="from-background w-full bg-gradient-to-t to-cyan-100/60 py-20 md:py-32 lg:py-40 dark:to-blue-950/60"
	>
		<div class="container mx-auto px-4 text-center">
			<h1 class="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
				{@html $t('home.hero.title')}
			</h1>
			<p class="text-muted-foreground mx-auto mt-4 max-w-[700px] text-lg md:text-xl">
				{$t('home.hero.subtitle')}
			</p>
			<div class="mt-6">
				<Button size="lg" href="/dash">
					{$t('home.hero.cta')}
					<ArrowRight class="ml-2 h-5 w-5" />
				</Button>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="bg-card w-full py-12 md:py-24">
		<div class="container mx-auto px-4">
			<h2
				class="text-primary mb-12 text-center text-3xl font-bold tracking-tighter drop-shadow-lg sm:text-4xl md:text-5xl"
			>
				{$t('home.features.title')}
			</h2>
			<div class="grid items-start gap-8 md:grid-cols-3">
				<HomeCard>
					{#snippet header()}
						<Thermometer class="text-primary h-8 w-8" />
						<h3>{$t('home.features.feature1.title')}</h3>
					{/snippet}
					{#snippet content()}
						<CurrentDayCard {todayStat} {latestMeasurement} isLoading={false} />
					{/snippet}
				</HomeCard>
				<HomeCard>
					{#snippet header()}
						<CloudSun class="text-primary h-8 w-8" />
						<h3>{$t('home.features.feature2.title')}</h3>
					{/snippet}
					{#snippet content()}
						<ForecastCard {forecast} stationId={0} measurementPreview={latestMeasurement} />
					{/snippet}
				</HomeCard>
				<HomeCard>
					{#snippet header()}
						<MapPin class="text-primary h-8 w-8" />
						<h3>{$t('home.features.feature3.title')}</h3>
					{/snippet}
					{#snippet content()}
						<div class="overflow-hidden rounded-md">
							<Map latitude={48.1486} longitude={17.1077} zoom={13} class="h-[200px]" preview />
						</div>
					{/snippet}
				</HomeCard>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	{#if !globalState.user}
		<section
			class="from-background w-full bg-gradient-to-b to-cyan-100 py-20 md:py-32 lg:py-40 dark:to-cyan-950"
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
