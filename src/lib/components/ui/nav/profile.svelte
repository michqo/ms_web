<script lang="ts">
	import { User } from 'lucide-svelte';
	import * as Dialog from '../dialog';
	import UserDialog from './user-dialog.svelte';

  const { user }: { user?: string } = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class="flex cursor-default items-center gap-2">
		<User class="mr-2" />
		<span>Profile</span>
	</Dialog.Trigger>
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
    </div>
	</Dialog.Content>
</Dialog.Root>
