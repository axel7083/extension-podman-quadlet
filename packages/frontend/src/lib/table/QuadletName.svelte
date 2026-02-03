<script lang="ts">
import type { QuadletInfo } from '@quadlet/core-api';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { isServiceQuadlet } from '@quadlet/core-api';

interface Props {
  object: QuadletInfo;
}

let { object }: Props = $props();

let name = $derived(isServiceQuadlet(object) ? object.service : object.path);

function openDetails(quadlet: QuadletInfo): Promise<void> {
  return goto(
    resolve(`/quadlets/[providerId]/[connection]/[id]`, {
      providerId: quadlet.connection.providerId,
      connection: quadlet.connection.name,
      id: quadlet.id,
    }),
  );
}
</script>

<button
  title={name}
  class="hover:cursor-pointer w-full overflow-hidden text-ellipsis"
  aria-label="quadlet name"
  onclick={openDetails.bind(undefined, object)}>
  {name}
</button>
