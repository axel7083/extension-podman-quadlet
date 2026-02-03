<script lang="ts">
import type { PageProps } from './$types';
import ProgressBar from '/@/lib/progress/ProgressBar.svelte';
import QuadletGenerateForm from '/@/lib/forms/quadlet/QuadletGenerateForm.svelte';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

// We get the query parameters from the parent
let { data }: PageProps = $props();

let loading: boolean = $state(false);

function close(): Promise<void> {
  return goto(resolve('/'));
}
</script>

<!-- loading indicator -->
<div class="h-0.5">
  <!-- avoid flickering -->
  {#if loading}
    <ProgressBar class="w-full h-0.5" width="w-full" height="h-0.5" />
  {/if}
</div>

<QuadletGenerateForm close={close} {...data} bind:loading={loading} />
