<script lang="ts">
import { DetailsPage, Tab } from '@podman-desktop/ui-svelte';
import type { LayoutProps } from './$types';
import { isServiceQuadlet, isServiceLessQuadlet } from '@quadlet/core-api';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import QuadletActions from '/@/lib/table/QuadletActions.svelte';
import QuadletStatus from '/@/lib/table/QuadletStatus.svelte';
import { page } from '$app/state';
import IconTab from '/@/lib/tab/IconTab.svelte';
import { faWarning } from '@fortawesome/free-solid-svg-icons/faWarning';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { quadletsInfo } from '/@store/quadlets';

let { children, data, params }: LayoutProps = $props();

// the title is either the systemd service name or if undefined the last part of the path (E.g. /foo/bar.container => bar.container)
let title: string = $derived.by(() => {
  if (isServiceQuadlet(data.quadlet)) {
    return data.quadlet.service;
  }

  return data.quadlet.path.split('/').pop() ?? 'none';
});

export function close(): Promise<void> {
  return goto(resolve('/'));
}

$effect(() => {
  /**
   * Special effect to redirect out if the quadlet is deleted
   */
  const quadlet = $quadletsInfo.find(
    quadlet =>
      quadlet.id === params.id &&
      quadlet.connection.name === params.connection &&
      quadlet.connection.providerId === params.providerId,
  );
  if (!quadlet) close().catch(console.error);
});
</script>

<DetailsPage title={title} breadcrumbLeftPart="Quadlets" breadcrumbRightPart={title} onbreadcrumbClick={close}>
  {#snippet actionsSnippet()}
    <QuadletActions object={data.quadlet} />
  {/snippet}
  {#snippet iconSnippet()}
    <QuadletStatus object={data.quadlet} />
  {/snippet}
  {#snippet tabsSnippet()}
    <!-- source tab -->
    <Tab
      title="Source"
      url={resolve('/quadlets/[providerId]/[connection]/[id]', {
        providerId: data.quadlet.connection.providerId,
        connection: data.quadlet.connection.name,
        id: data.quadlet.id,
      })}
      selected={page.url.pathname ===
        `/quadlets/${data.quadlet.connection.providerId}/${data.quadlet.connection.name}/${data.quadlet.id}`} />

    <!-- systemd-service tab -->
    {#if isServiceQuadlet(data.quadlet)}
      <Tab
        title="Systemd Service"
        url={resolve('/quadlets/[providerId]/[connection]/[id]/systemd-service', {
          providerId: data.quadlet.connection.providerId,
          connection: data.quadlet.connection.name,
          id: data.quadlet.id,
        })}
        selected={page.url.pathname ===
          `/quadlets/${data.quadlet.connection.providerId}/${data.quadlet.connection.name}/${data.quadlet.id}/systemd-service`} />
    {/if}

    <!-- error tab -->
    {#if isServiceLessQuadlet(data.quadlet) && data.quadlet.stderr}
      <IconTab
        title="Error"
        url={resolve('/quadlets/[providerId]/[connection]/[id]/error', {
          providerId: data.quadlet.connection.providerId,
          connection: data.quadlet.connection.name,
          id: data.quadlet.id,
        })}
        icon={faWarning}
        selected={page.url.pathname ===
          `/quadlets/${data.quadlet.connection.providerId}/${data.quadlet.connection.name}/${data.quadlet.id}/error`} />
    {/if}

    <!-- journalctl tab -->
    {#if isServiceQuadlet(data.quadlet)}
      <Tab
        title="Logs"
        url={resolve('/quadlets/[providerId]/[connection]/[id]/logs', {
          providerId: data.quadlet.connection.providerId,
          connection: data.quadlet.connection.name,
          id: data.quadlet.id,
        })}
        selected={page.url.pathname ===
          `/quadlets/${data.quadlet.connection.providerId}/${data.quadlet.connection.name}/${data.quadlet.id}/logs`} />
    {/if}

    <!-- files -->
    {#each data.quadlet.files as file (file.path)}
      {@const fileId = encodeURIComponent(file.path)}
      <IconTab
        title={file.name}
        url={resolve('/quadlets/[providerId]/[connection]/[id]/file/[fileId]', {
          providerId: data.quadlet.connection.providerId,
          connection: data.quadlet.connection.name,
          id: data.quadlet.id,
          fileId: fileId,
        })}
        icon={faPaperclip}
        selected={page.url.pathname ===
          `/quadlets/${data.quadlet.connection.providerId}/${data.quadlet.connection.name}/${data.quadlet.id}/file/${fileId}`} />
    {/each}
  {/snippet}
  {#snippet contentSnippet()}
    <div class="flex flex-col w-full h-full min-h-0">
      {@render children()}
    </div>
  {/snippet}
</DetailsPage>
