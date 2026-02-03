<script lang="ts">
import type { PageProps } from './$types';
import ProgressBar from '/@/lib/progress/ProgressBar.svelte';
import QuadletComposeForm from '/@/lib/forms/compose/QuadletComposeForm.svelte';

// We get the query parameters from the parent
let { data }: PageProps = $props();

let loading: boolean = $state(false);
</script>

<!-- loading indicator -->
<div class="h-0.5">
  <!-- avoid flickering -->
  {#if loading}
    <ProgressBar class="w-full h-0.5" width="w-full" height="h-0.5" />
  {/if}
</div>

<QuadletComposeForm bind:loading={loading} {...data} />
