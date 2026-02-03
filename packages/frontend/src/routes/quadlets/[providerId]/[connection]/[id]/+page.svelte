<script lang="ts">
import type { PageProps } from './$types';
import { onMount } from 'svelte';
import { ErrorMessage } from '@podman-desktop/ui-svelte';
import { quadletAPI } from '/@/api/client';
import ProgressBar from '/@/lib/progress/ProgressBar.svelte';
import EditorOverlay from '/@/lib/forms/EditorOverlay.svelte';
import MonacoEditor from '/@/lib/monaco-editor/MonacoEditor.svelte';

let { data }: PageProps = $props();

let loading: boolean = $state(true);
let quadletSource: string | undefined = $state(undefined);
let originalSource: string | undefined = $state(undefined);
let quadletSourceError: string | undefined = $state(undefined);
let changed: boolean = $derived(quadletSource !== originalSource);

onMount(async () => {
  try {
    loading = true;
    quadletSource = await quadletAPI.read(
      {
        providerId: data.quadlet.connection.providerId,
        name: data.quadlet.connection.name,
      },
      data.quadlet.id,
    );
    // copy the original
    originalSource = quadletSource;
    quadletSourceError = undefined;
  } catch (err: unknown) {
    console.error(err);
    quadletSourceError = String(err);
  } finally {
    loading = false;
  }
});

async function save(): Promise<void> {
  if (!quadletSource) return;

  loading = true;
  try {
    await quadletAPI.writeIntoMachine({
      connection: { providerId: data.quadlet.connection.providerId, name: data.quadlet.connection.name },
      files: [
        {
          filename: data.quadlet.path,
          content: quadletSource,
        },
      ],
    });
    // we should be good to consider we updated it
    originalSource = quadletSource;
  } catch (err: unknown) {
    console.error(err);
  } finally {
    loading = false;
  }
}

function onchange(content: string): void {
  quadletSource = content;
}
</script>

<!-- loading indicator -->
<div class="h-0.5">
  <!-- avoid flickering -->
  {#if loading}
    <ProgressBar class="w-full h-0.5" width="w-full" height="h-0.5" />
  {/if}
</div>

<div class="flex py-2 h-[40px]">
  <span class="block w-auto text-sm font-medium whitespace-nowrap leading-6 text-[var(--pd-content-text)] pl-2 pr-2">
    {data.quadlet.path}
  </span>
  {#if quadletSourceError}
    <ErrorMessage error={quadletSourceError} />
  {/if}
</div>
{#if quadletSource}
  <EditorOverlay save={save} loading={loading} changed={changed} />
  <MonacoEditor class="h-full" onChange={onchange} content={quadletSource} language="ini" />
{/if}
