<script lang="ts">
import { tabs } from '/@store/tabs';
import type { Tab } from '/@shared/src/models/Tab';
import QuadletCompose from '/@/pages/QuadletCompose.svelte';
import QuadletDetails from '/@/pages/QuadletDetails.svelte';
import QuadletsList from '/@/pages/QuadletsList.svelte';
import QuadletGenerate from '/@/pages/QuadletGenerate.svelte';
import Route from '/@/lib/Route.svelte';
import TabComponent from '/@/lib/pagination/TabComponent.svelte';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { router } from 'tinro';
import { loggerAPI, quadletAPI, routingAPI, rpcBrowser } from '/@/api/client';
import { LoggerStore } from '/@store/logger-store';
import XTerminal from '/@/lib/terminal/XTerminal.svelte';

const selected: string | undefined = $derived($tabs.find((tab) => $router.path === tab.body.route)?.id);

function onClose(tab: Tab): void {
  if(tab.locked) return;

  if(selected === tab.id) {
    router.goto('/');
  }

  routingAPI.closeTab(tab.id).catch(console.error);

  // check for logger tab
  if(loggers.has(tab.id)) {
    console.log('cleanup logger');
    quadletAPI.disposeLogger(tab.id).catch(console.error);
    loggers.delete(tab.id);
  }
}

// not reactive
let loggers: Map<string, LoggerStore> = new Map<string, LoggerStore>();

function getLogger(loggerId: string): LoggerStore {
  let logger = loggers.get(loggerId);
  if(logger) return logger;

  // create logger
  logger = new LoggerStore({
    loggerId: loggerId,
    rpcBrowser: rpcBrowser,
    loggerAPI: loggerAPI,
  });
  logger.init().catch(console.error);
  loggers.set(loggerId, logger);
  return logger;
}
</script>

<!-- tabs -->
<nav class="flex gap-x-2 h-[40px] flex-row px-2 border-b border-[var(--pd-content-divider)]">
  {#each $tabs as tab (tab.id)}
    <TabComponent
      icon={tab.locked?faLock:undefined}
      url={tab.body.route}
      title={tab.title}
      onClose={tab.locked?undefined:onClose.bind(undefined, tab)}
      selected={$router.path === tab.body.route}
    />
  {/each}
</nav>
<!-- main -->
<main class="flex flex-col bg-[var(--pd-content-bg)] h-full">
  <!-- list all quadlets -->
  <Route path="/" breadcrumb="Quadlets">
    <QuadletsList />
  </Route>

  <!-- create quadlet -->
  <Route path="/quadlets/generate/*" firstmatch let:meta>
    <QuadletGenerate
      providerId={meta.query.providerId}
      connection={meta.query.connection}
      quadletType={meta.query.quadletType}
      resourceId={meta.query.resourceId} />
  </Route>

  <Route path="logger/:loggerId" let:meta>
    <XTerminal store={getLogger(meta.params.loggerId)} />
  </Route>

  <Route path="/quadlets/compose/*" firstmatch let:meta>
    <QuadletCompose
      providerId={meta.query.providerId}
      connection={meta.query.connection}
      filepath={meta.query.filepath} />
  </Route>

  <!-- quadlets details -->
  <Route path="/quadlets/:providerId/:connection/:id/*" firstmatch let:meta>
    <QuadletDetails providerId={meta.params.providerId} connection={meta.params.connection} id={meta.params.id} />
  </Route>
</main>

