<script lang="ts">
import ProgressBar from '/@/lib/progress/ProgressBar.svelte';
import { router } from 'tinro';
import QuadletGenerateForm from '/@/lib/forms/quadlet/QuadletGenerateForm.svelte';
import type { QuadletGenerateFormProps } from '/@/lib/forms/quadlet/quadlet-utils';

// We get the query parameters from the parent
let props: QuadletGenerateFormProps = $props();

let loading: boolean = $state(false);

function close(): void {
  router.goto('/');
}
</script>

<div class="flex flex-col w-full">
  <!-- loading indicator -->
  <div class="h-0.5">
    <!-- avoid flickering -->
    {#if loading}
      <ProgressBar class="w-full h-0.5" width="w-full" height="h-0.5" />
    {/if}
  </div>

  <QuadletGenerateForm close={close} {...props} bind:loading={loading} />
</div>
