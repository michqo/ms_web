<script lang="ts">
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import { Button, buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import * as Form from '@/components/ui/form';
	import { Input } from '@/components/ui/input';
	import { api } from '@/shared';
	import { stationSchema } from '@/shared/schemas';
	import type { Station } from '@/shared/types';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	interface Props {
		open: boolean;
		station?: Partial<Station>;
	}

	let { open = $bindable(), station }: Props = $props();

	const client = useQueryClient();
	const isNewStation = !station;

	let deleteDialogOpen = $state(false);

	const form = superForm(
		{
			name: station?.name || '',
			latitude: station?.latitude || 0,
			longitude: station?.longitude || 0
		},
		{
			SPA: true,
			validators: zodClient(stationSchema),
			onUpdate: async ({ form: f }) => {
				if (f.valid) {
					if (isNewStation) {
						await api.createStation(f.data);
						toast.success('Station created successfully');
					} else {
						await api.updateStation(station?.id!, f.data);
						toast.success('Station updated successfully');
					}
					await client.invalidateQueries({ queryKey: ['stations'] });
					open = false;
				} else {
					toast.error(isNewStation ? 'Failed to create station' : 'Failed to update station');
					open = false;
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	async function deleteStation() {
		try {
			await api.deleteStation(station?.id!);
			toast.success('Station deleted successfully');
			deleteDialogOpen = false;
			open = false;
			await client.invalidateQueries({ queryKey: ['stations'] });
		} catch (error) {
			toast.error('Failed to delete station');
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{isNewStation ? 'Create Station' : 'Manage Station'}</Dialog.Title>
			<Dialog.Description>
				{isNewStation
					? 'Add a new station to your system'
					: 'Update station details or delete the station'}
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="latitude">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Latitude</Form.Label>
							<Input {...props} bind:value={$formData.latitude} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="longitude">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Longitude</Form.Label>
							<Input {...props} bind:value={$formData.longitude} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<Dialog.Footer class="flex-col sm:flex-row sm:justify-between">
				{#if !isNewStation}
					<Button type="button" variant="destructive" onclick={() => (deleteDialogOpen = true)}>
						Delete Station
					</Button>
				{:else}
					<div></div>
				{/if}

				<div class="mt-2 flex gap-2 sm:mt-0">
					<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}>
						Cancel
					</Dialog.Close>
					<Form.Button type="submit">{isNewStation ? 'Create' : 'Save Changes'}</Form.Button>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

{#if !isNewStation}
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Delete Station</AlertDialog.Title>
				<AlertDialog.Description>
					Are you sure you want to delete this station? This action cannot be undone.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={deleteStation}
					class="bg-destructive text-destructive-foreground"
				>
					Delete
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
