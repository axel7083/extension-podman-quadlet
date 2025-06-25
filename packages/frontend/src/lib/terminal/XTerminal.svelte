<script lang="ts">
import '@xterm/xterm/css/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import { Terminal } from '@xterm/xterm';

import { onDestroy, onMount } from 'svelte';
import { getTerminalTheme } from '/@/lib/terminal/terminal-theme';
import type { LoggerEventTarget } from '/@/events/LoggerEventTarget';

let terminalXtermDiv: HTMLDivElement;
let serializeAddon: SerializeAddon;
let fitAddon: FitAddon;
let shellTerminal: Terminal;
let resizeObserver: ResizeObserver;

interface Props {
  store: LoggerEventTarget;
  readonly?: boolean;
}

let { store, readonly }: Props = $props();

async function refreshTerminal(): Promise<void> {
  // missing element, return
  if (!terminalXtermDiv) {
    return;
  }
  shellTerminal = new Terminal({
    theme: getTerminalTheme(),
    disableStdin: readonly,
  });

  fitAddon = new FitAddon();
  serializeAddon = new SerializeAddon();
  shellTerminal.loadAddon(fitAddon);
  shellTerminal.loadAddon(serializeAddon);

  shellTerminal.open(terminalXtermDiv);

  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(() => {
    fitAddon?.fit();
  });
  resizeObserver.observe(terminalXtermDiv);

  fitAddon.fit();
}

function loggerAppendListener(event: CustomEvent<string>): void {
  shellTerminal.writeln(event.detail);
}

onMount(async () => {
  await refreshTerminal();

  // write existing content
  store.ready.then((logs) => {
    logs.forEach((log) => {
      shellTerminal.writeln(log);
    });
  }).catch(console.error);

  // subscribe for follow-up
  store.addEventListener('append', loggerAppendListener);
});

onDestroy(() => {
  // unsubscribe to update
  store.removeEventListener('append', loggerAppendListener);
  serializeAddon?.dispose();
  shellTerminal?.dispose();
  fitAddon?.dispose();
  // Cleanup the observer on destroy
  resizeObserver?.unobserve(terminalXtermDiv);
});
</script>

<div class="h-full p-[5px] pr-0 bg-[var(--pd-terminal-background)]" bind:this={terminalXtermDiv}></div>
