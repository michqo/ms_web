<script lang="ts">
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import { Button } from '@/components/ui/button';
	import { api } from '@/shared';
	import { deleteMeasurementSchema } from '@/shared/schemas';
	import { getLocalTimeZone } from '@internationalized/date';
	import dayjs from 'dayjs';
	import { Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import FormPicker from '../ui/calendar/form-picker.svelte';
	import { t } from '@/translations';
	import { globalState } from '@/shared/runes.svelte';

	interface Props {
		open: boolean;
		stationId: number;
	}

	let { open = $bindable(), stationId }: Props = $props();

	const form = superForm(defaults(zod(deleteMeasurementSchema)), {
		dataType: 'json',
		SPA: true,
		validators: zodClient(deleteMeasurementSchema),
		onUpdate: async ({ form: f }) => {
			if (f.valid) {
				try {
					const gtDate = f.data.created_at__gt?.toDate(getLocalTimeZone());
					const ltDate = f.data.created_at__lt?.toDate(getLocalTimeZone());
					const gt = gtDate && dayjs(gtDate).startOf('day').toISOString();
					const lt = ltDate && dayjs(ltDate).endOf('day').toISOString();
					await api.deleteMeasurements(stationId, gt, lt);
					open = false;
					toast.success($t('measurements.dialog.delete.success'));
				} catch (error) {
					toast.error($t('measurements.dialog.delete.error'));
				}
			} else {
				toast.error($t('measurements.dialog.delete.error'));
				console.log(f.errors);
			}
		}
	});

	function handleClose() {
		open = false;
	}

	const { form: formData, enhance, submitting } = form;
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content
		class={[
			'flex flex-col sm:max-w-md',
			{ 'h-[100vh] w-screen max-w-none rounded-none border-0': globalState.isMobile.value }
		]}
	>
		<AlertDialog.Header>
			<AlertDialog.Title>{$t('measurements.dialog.delete.title')}</AlertDialog.Title>
			<AlertDialog.Description>
				{$t('measurements.dialog.delete.description')}
			</AlertDialog.Description>
		</AlertDialog.Header>

		<form method="POST" use:enhance class="mt-10 flex h-full flex-col justify-between">
			<div class="flex flex-col gap-2">
				<FormPicker
					{form}
					name="created_at__gt"
					label={$t('measurements.dialog.delete.form_label_newer')}
					optional
				/>
				<FormPicker
					{form}
					name="created_at__lt"
					label={$t('measurements.dialog.delete.form_label_older')}
					optional
				/>
			</div>
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button" onclick={handleClose} disabled={$submitting}
					>{$t('measurements.dialog.delete.cancel')}</AlertDialog.Cancel
				>
				<Button type="submit" variant="destructive" disabled={$submitting} class="gap-2">
					{#if $submitting}
						<Loader2 class="h-4 w-4 animate-spin" />
						<span>{$t('measurements.dialog.delete.submit_button_loading')}</span>
					{:else}
						<span>{$t('measurements.dialog.delete.submit_button')}</span>
					{/if}
				</Button>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
