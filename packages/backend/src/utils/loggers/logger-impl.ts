/**
 * @author axel7083
 */
import type { Webview, CancellationToken } from '@podman-desktop/api';
import { CancellationTokenSource } from '@podman-desktop/api';
import { Messages } from '/@shared/src/messages';
import { BetterLogger } from './better-logger';

interface Dependencies {
  webview: Webview;
  maxLogsLengths?: number;
  loggerId: string;
}

const DEFAULT_MAX_LOGS_LENGTH = 200;

export class LoggerImpl extends BetterLogger {
  #logs: string[] = [];
  #tokenSource: CancellationTokenSource | undefined;

  get token(): CancellationToken {
    if (!this.#tokenSource) throw new Error('logger has been disposed');
    return this.#tokenSource?.token;
  }

  constructor(protected dependencies: Dependencies) {
    super(dependencies.loggerId);
    this.#tokenSource = new CancellationTokenSource();
  }

  override log(...data: unknown[]): void {
    return this.onData(data);
  }
  override error(...data: unknown[]): void {
    return this.onData(data);
  }
  override warn(...data: unknown[]): void {
    return this.onData(data);
  }

  protected onData(...data: unknown[]): void {
    if (this.#tokenSource?.token?.isCancellationRequested) return;

    // split by line separator
    data
      .reduce((accumulator: Array<string>, current) => {
        accumulator.push(...String(current).trimEnd().split('\n'));
        return accumulator;
      }, [] as string[])
      .forEach((data: string) => {
        this.append(data);
      });
  }

  override all(): Array<string> {
    return this.#logs;
  }

  override dispose(): void {
    this.#tokenSource?.cancel();
    this.#tokenSource?.dispose();
    this.#tokenSource = undefined;
    this.#logs = [];
  }

  protected append(content: string): void {
    this.#logs.push(content);
    this.notify(content); // notify frontend

    if (this.#logs.length > (this.dependencies.maxLogsLengths ?? DEFAULT_MAX_LOGS_LENGTH)) {
      this.#logs.shift();
    }
  }

  protected notify(str: string): void {
    this.dependencies.webview
      .postMessage({
        id: Messages.LOGGER_DATA,
        body: {
          value: str,
          loggerId: this.dependencies.loggerId,
        },
      })
      .catch(console.error);
  }
}
