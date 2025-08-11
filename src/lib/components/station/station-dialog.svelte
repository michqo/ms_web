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
	import { globalState } from '@/shared/runes.svelte';

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
						toast.success($t('dash.dialog.messages.createSuccess'));
					} else {
						await api.updateStation(station?.id!, f.data);
						toast.success($t('dash.dialog.messages.updateSuccess'));
					}
					await client.invalidateQueries({ queryKey: ['stations'] });
					open = false;
				} else {
					toast.error(
						isNewStation
							? $t('dash.dialog.messages.createError')
							: $t('dash.dialog.messages.updateError')
					);
					open = false;
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	async function deleteStation() {
		try {
			await api.deleteStation(station?.id!);
			toast.success($t('dash.dialog.messages.deleteSuccess'));
			deleteDialogOpen = false;
			open = false;
			await client.invalidateQueries({ queryKey: ['stations'] });
		} catch (error) {
			toast.error($t('dash.dialog.messages.deleteError'));
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.MobileContent class={{ 'justify-between': globalState.isMobile.value }}>
		<Dialog.Header>
			<Dialog.Title
				>{isNewStation
					? $t('dash.dialog.createStation.title')
					: $t('dash.dialog.manageStation.title')}</Dialog.Title
			>
			<Dialog.Description>
				{isNewStation
					? $t('dash.dialog.createStation.description')
					: $t('dash.dialog.manageStation.description')}
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" use:enhance class="space-y-4">
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{$t('dash.dialog.createStation.form_name')}</Form.Label>
						<Input {...props} bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="mt-4 space-y-2">
				<Label>{$t('dash.dialog.createStation.form_location')}</Label>
				<Map bind:latitude={$formData.latitude} bind:longitude={$formData.longitude} />
			</div>

			<Dialog.Footer class="flex-col sm:flex-row sm:justify-between">
				{#if !isNewStation}
					<Button type="button" variant="destructive" onclick={() => (deleteDialogOpen = true)}>
						{$t('dash.dialog.manageStation.delete')}
					</Button>
				{:else}
					<div></div>
				{/if}

				<div class="mt-2 flex gap-2 sm:mt-0">
					<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}>
						{$t('dash.dialog.manageStation.cancel')}
					</Dialog.Close>
					<Form.Button type="submit"
						>{isNewStation
							? $t('dash.dialog.createStation.create')
							: $t('dash.dialog.manageStation.update')}</Form.Button
					>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.MobileContent>
</Dialog.Root>

{#if !isNewStation}
	<AlertDialog.Root bind:open={deleteDialogOpen}>
		<AlertDialog.Content
			class={[
				'flex flex-col sm:max-w-md',
				{ 'h-[100vh] w-screen max-w-none rounded-none border-0': globalState.isMobile.value }
			]}
		>
			<AlertDialog.Header>
				<AlertDialog.Title>{$t('dash.dialog.manageStation.confirm_title')}</AlertDialog.Title>
				<AlertDialog.Description>
					{$t('dash.dialog.manageStation.confirm_description')}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>{$t('dash.dialog.manageStation.cancel')}</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={deleteStation}
					class="bg-destructive text-destructive-foreground"
				>
					{$t('dash.dialog.manageStation.delete')}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
