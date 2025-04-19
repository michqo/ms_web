<script lang="ts">
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import { Button, buttonVariants } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import * as Form from '@/components/ui/form';
	import { Input } from '@/components/ui/input';
	import { Map } from '@/components/ui/map';
	import { api } from '@/shared';
	import { stationSchema } from '@/shared/schemas';
	import type { Station } from '@/shared/types';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Label } from '../ui/label';
	import { t } from '@/translations';

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
			latitude: station?.latitude || 48.1,
			longitude: station?.longitude || 17.1
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
			<Dialog.Title
				>{isNewStation
					? $t('home.dialog.createStation.title')
					: $t('home.dialog.manageStation.title')}</Dialog.Title
			>
			<Dialog.Description>
				{isNewStation
					? $t('home.dialog.createStation.description')
					: $t('home.dialog.manageStation.description')}
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('home.dialog.createStation.form_name')}</Form.Label>
						<Input {...props} bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="mt-4 space-y-2">
				<Label>{$t('home.dialog.createStation.form_location')}</Label>
				<Map bind:latitude={$formData.latitude} bind:longitude={$formData.longitude} />
			</div>

			<Dialog.Footer class="flex-col sm:flex-row sm:justify-between">
				{#if !isNewStation}
					<Button type="button" variant="destructive" onclick={() => (deleteDialogOpen = true)}>
						{$t('home.dialog.manageStation.delete')}
					</Button>
				{:else}
					<div></div>
				{/if}

				<div class="mt-2 flex gap-2 sm:mt-0">
					<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}>
						{$t('home.dialog.manageStation.cancel')}
					</Dialog.Close>
					<Form.Button type="submit"
						>{isNewStation
							? $t('home.dialog.createStation.create')
							: $t('home.dialog.manageStation.update')}</Form.Button
					>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

{#if !isNewStation}
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>{$t('home.dialog.manageStation.confirm_title')}</AlertDialog.Title>
				<AlertDialog.Description>
					{$t('home.dialog.manageStation.confirm_description')}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>{$t('home.dialog.manageStation.cancel')}</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={deleteStation}
					class="bg-destructive text-destructive-foreground"
				>
					{$t('home.dialog.manageStation.delete')}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
