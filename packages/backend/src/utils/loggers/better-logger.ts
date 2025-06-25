import type { Disposable, Logger as ILogger } from '@podman-desktop/api';

export abstract class BetterLogger implements Disposable, ILogger {
  protected constructor(public id: string) {}

  abstract dispose(): void;
  abstract error(...data: unknown[]): void;
  abstract log(...data: unknown[]): void;
  abstract warn(...data: unknown[]): void;
  abstract all(): Array<string>;
}
