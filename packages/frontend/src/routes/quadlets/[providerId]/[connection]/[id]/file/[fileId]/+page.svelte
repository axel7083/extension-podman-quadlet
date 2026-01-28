<script lang="ts">
import type { PageProps } from './$types';
import FileEditor from '/@/lib/monaco-editor/FileEditor.svelte';
import ProgressBar from '/@/lib/progress/ProgressBar.svelte';

let { data, params }: PageProps = $props();

let loading = $state(false);
</script>

<!-- loading indicator -->
<div class="h-0.5">
  <!-- avoid flickering -->
  {#if loading}
    <ProgressBar class="w-full h-0.5" width="w-full" height="h-0.5" />
  {/if}
</div>

<FileEditor
  connection={data.quadlet.connection}
  bind:loading={loading}
  path={decodeURIComponent(params.fileId)} />
