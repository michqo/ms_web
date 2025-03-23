<script lang="ts">
	import { buttonVariants } from '@/components/ui/button';
	import { cn } from '@/utils';
	import { CalendarDate, DateFormatter, getLocalTimeZone, today } from '@internationalized/date';
	import { CalendarIcon } from 'lucide-svelte';
	import { Calendar } from '../calendar';
	import * as Form from '../form';
	import * as Popover from '../popover';

	interface Props {
		form: any;
		name: string;
		label: string;
		optional?: boolean;
	}

	let { form, name, label, optional = false }: Props = $props();

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	const placeholder = today(getLocalTimeZone());

	const { form: formData } = form;
</script>

<Form.Field {form} {name} class="flex flex-col">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>
				{label}
				{#if optional}
					<span class="ml-1 text-sm text-muted-foreground">(Optional)</span>
				{/if}
			</Form.Label>
			<Popover.Root>
				<Popover.Trigger
					{...props}
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'w-[280px] justify-start pl-4 text-left font-normal',
						!$formData[name] && 'text-muted-foreground'
					)}
				>
					{$formData[name] ? df.format($formData[name].toDate(getLocalTimeZone())) : 'Pick a date'}
					<CalendarIcon class="ml-auto size-4 opacity-50" />
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0" side="top">
					<Calendar
						type="single"
						bind:value={$formData[name]}
						{placeholder}
						minValue={new CalendarDate(2025, 1, 1)}
						maxValue={today(getLocalTimeZone())}
						calendarLabel={label}
					/>
				</Popover.Content>
			</Popover.Root>
			<Form.FieldErrors />
			<input hidden value={$formData[name]} name={props.name} />
		{/snippet}
	</Form.Control>
</Form.Field>
