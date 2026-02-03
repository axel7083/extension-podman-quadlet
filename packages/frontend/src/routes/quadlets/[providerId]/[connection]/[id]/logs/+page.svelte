<script lang="ts">
import type { PageProps } from './$types';
import { LoggerStore } from '/@store/logger-store';
import { onDestroy, onMount } from 'svelte';
import { isTemplateQuadlet, isServiceQuadlet } from '@quadlet/core-api';
import { loggerAPI, quadletAPI, rpcBrowser } from '/@/api/client';
import XTerminal from '/@/lib/terminal/XTerminal.svelte';

let { data }: PageProps = $props();
let logger: LoggerStore | undefined = $state();
let loggerId: string | undefined = $state(undefined);

onMount(async () => {
  // create logger
  createLogger().catch(console.error);
});

async function createLogger(): Promise<void> {
  if (isTemplateQuadlet(data.quadlet) && !data.quadlet.defaultInstance)
    throw new Error('Cannot create logger for a template');

  loggerId = await quadletAPI.createQuadletLogger({
    quadletId: data.quadlet.id,
    connection: {
      providerId: data.quadlet.connection.providerId,
      name: data.quadlet.connection.name,
    },
  });

  // creating logger subscriber
  logger = new LoggerStore({
    loggerId: loggerId,
    rpcBrowser: rpcBrowser,
    loggerAPI: loggerAPI,
  });
  return logger.init();
}

onDestroy(() => {
  logger?.dispose();
  logger = undefined;
  // dispose logger => will kill the process, we don't want to keep it alive if we leave the page
  if (loggerId) {
    quadletAPI.disposeLogger(loggerId).catch(console.error);
  }
});
</script>

{#if isServiceQuadlet(data.quadlet)}
  <div class="flex py-2 h-[40px]">
    <span
      role="banner"
      aria-label="journactl command"
      class="block w-auto text-sm font-medium whitespace-nowrap leading-6 text-[var(--pd-content-text)] pl-2 pr-2">
      journalctl --user --follow --unit={data.quadlet.service}
    </span>
  </div>
{/if}
{#if logger}
  <XTerminal store={logger} />
{/if}
