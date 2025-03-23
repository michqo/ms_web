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

	interface Props {
		open: boolean;
		stationId: number;
		onSuccess: () => void;
	}

	let { open = $bindable(), stationId, onSuccess }: Props = $props();

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
					onSuccess();
					toast.success('Measurements deleted successfully');
				} catch (error) {
					toast.error('Failed to delete measurements');
				}
			} else {
        toast.error('Failed to delete measurements');
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
	<AlertDialog.Content class="sm:max-w-md">
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Measurements</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete measurements that match the criteria below. This action cannot
				be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>

		<form method="POST" use:enhance class="space-y-4">
			<FormPicker
        form={form}
        name="created_at__gt"
        label="Newer than"
        optional
      />
      <FormPicker
        form={form}
        name="created_at__lt"
        label="Older than"
        optional
      />
			<AlertDialog.Footer>
				<AlertDialog.Cancel type="button" onclick={handleClose} disabled={$submitting}
					>Cancel</AlertDialog.Cancel
				>
				<Button type="submit" variant="destructive" disabled={$submitting} class="gap-2">
					{#if $submitting}
						<Loader2 class="h-4 w-4 animate-spin" />
						<span>Deleting...</span>
					{:else}
						<span>Delete Measurements</span>
					{/if}
				</Button>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
