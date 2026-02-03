<script lang="ts">
import XTerminal from '/@/lib/terminal/XTerminal.svelte';
import { isServiceLessQuadlet } from '@quadlet/core-api';
import type { PageProps } from './$types';
import { readable } from 'svelte/store';

let { data }: PageProps = $props();
</script>

{#if isServiceLessQuadlet(data.quadlet) && data.quadlet.stderr}
  <XTerminal store={readable(data.quadlet.stderr)} readonly />
{/if}
