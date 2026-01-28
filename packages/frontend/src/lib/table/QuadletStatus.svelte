<script lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';
import type { QuadletInfo } from '/@shared/src/models/quadlet-info';
import FileLinesIcon from './FileLinesIcon.svelte';
import FileCodeIcon from './FileCodeIcon.svelte';
import type { Component } from 'svelte';
import { isTemplateQuadlet } from '/@shared/src/models/template-quadlet.js';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

interface Props {
  object: QuadletInfo;
}

let { object }: Props = $props();

let icon: Component = $derived(isTemplateQuadlet(object) ? FileCodeIcon : FileLinesIcon);

let status: string = $derived.by(() => {
  switch (object.state) {
    case 'active':
      return 'RUNNING';
    case 'deleting':
      return 'DELETING';
    case 'error':
      return 'DEGRADED';
    case 'unknown':
    case 'inactive':
      return '';
  }
});

function openDetails(quadlet: QuadletInfo): Promise<void> {
  return goto(resolve(`/quadlets/[providerId]/[connection]/[id]`, {
    providerId: quadlet.connection.providerId,
    connection: quadlet.connection.name,
    id: quadlet.id,
  }));
}
</script>

<button onclick={openDetails.bind(undefined, object)}>
  <StatusIcon status={status} icon={icon} />
</button>
