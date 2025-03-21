<script lang="ts">
	import { User } from 'lucide-svelte';
	import * as Dialog from '../dialog';
	import UserDialog from './user-dialog.svelte';
	import PasswordDialog from './password-dialog.svelte';
	import DeleteDialog from './delete-dialog.svelte';
	import type { DeleteSchema } from '@/shared/schemas';
	import type { SuperValidated } from 'sveltekit-superforms';

  interface Props {
		user?: string,
		data: SuperValidated<DeleteSchema>,
		open: boolean
	}
  
  let { user, data, open = $bindable() }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit profile</Dialog.Title>
			<Dialog.Description>Update your profile information here</Dialog.Description>
		</Dialog.Header>
    <div class="flex flex-col gap-3">
      <div class="flex justify-between items-center">
        <div class="flex flex-col">
          <span class="text-sm">Username</span>
          <span class="text-sm text-muted-foreground">{user}</span>
        </div>
        <UserDialog {user} />
      </div>
      <div class="flex justify-between items-center">
        <span class="text-sm">Password</span>
        <PasswordDialog />
      </div>
      <div class="flex justify-between items-center">
        <span class="text-sm">Account</span>
        <DeleteDialog {data} />
      </div>
    </div>
	</Dialog.Content>
</Dialog.Root>
