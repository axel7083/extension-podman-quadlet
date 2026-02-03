<script lang="ts">
import type { LayoutProps } from './$types';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { faCode } from '@fortawesome/free-solid-svg-icons/faCode';
import Fa from 'svelte-fa';
import { FormPage } from '@podman-desktop/ui-svelte';

let { children }: LayoutProps = $props();

function close(): Promise<void> {
  return goto(resolve('/'));
}
</script>

<FormPage
  title="Generate Quadlet"
  onclose={close}
  breadcrumbLeftPart="Quadlets"
  breadcrumbRightPart="Generate"
  onbreadcrumbClick={close}>
  {#snippet icon()}
    <div class="rounded-full w-8 h-8 flex items-center justify-center">
      <Fa size="1.125x" class="text-[var(--pd-content-header-icon)]" icon={faCode} />
    </div>
  {/snippet}
  {#snippet content()}
    <div class="flex flex-col w-full">
      {@render children()}
    </div>
  {/snippet}
</FormPage>
