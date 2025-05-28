<script lang="ts">
// app.css includes tailwind css dependencies that we use
import './app.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { router } from 'tinro';
import Route from './lib/Route.svelte';
import { onDestroy, onMount } from 'svelte';
import { getRouterState, rpcBrowser } from './api/client';
import { Messages } from '/@shared/src/messages';
import type { Unsubscriber } from 'svelte/store';
// import globally the monaco environment
import './lib/monaco-editor/monaco-environment';
import Layout from '/@/lib/Layout.svelte';

router.mode.hash();
let isMounted = $state(false);
const unsubscribers: Unsubscriber[] = [];

onMount(async () => {
  // Load router state on application startup
  const state = await getRouterState();
  router.goto(state.url);
  isMounted = true;

  unsubscribers.push(
    rpcBrowser.subscribe(Messages.ROUTE_UPDATE, location => {
      router.goto(location);
    }).unsubscribe,
  );
});

onDestroy(() => {
  unsubscribers.forEach(unsubscriber => unsubscriber());
});
</script>

<Route path="/*" breadcrumb="" isAppMounted={isMounted}>
  <Layout/>
</Route>
