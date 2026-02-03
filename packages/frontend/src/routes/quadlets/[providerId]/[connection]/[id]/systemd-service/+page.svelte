<script lang="ts">
import { isServiceQuadlet } from '@quadlet/core-api';
import type { PageProps } from './$types';
import MonacoEditor from '/@/lib/monaco-editor/MonacoEditor.svelte';

let { data }: PageProps = $props();
</script>

<div class="flex py-2 h-[40px]">
  <span class="block w-auto text-sm font-medium whitespace-nowrap leading-6 text-[var(--pd-content-text)] pl-2 pr-2">
    quadlet generated service
  </span>
</div>

{#if isServiceQuadlet(data.quadlet)}
  <MonacoEditor class="h-full" readOnly content={data.quadlet.content} language="ini" />
{/if}
