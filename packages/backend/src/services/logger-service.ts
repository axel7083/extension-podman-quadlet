/**
 * @author axel7083
 */
import type { Disposable, Webview } from '@podman-desktop/api';
import { randomUUID } from 'node:crypto';
import { LoggerImpl } from '../utils/logger-impl';
import { Publisher } from '../utils/publisher';
import { Messages } from '/@shared/src/messages';

interface Dependencies {
  webview: Webview;
}

export class LoggerService extends Publisher<Array<string>> implements Disposable {
  #registry: Map<string, LoggerImpl>;

  constructor(protected dependencies: Dependencies) {
    super(dependencies.webview, Messages.UPDATE_LOGGERS, () => this.all());
    this.#registry = new Map();
  }

  protected createID(): string {
    return randomUUID().toString();
  }

  all(): Array<string> {
    return Array.from(this.#registry.values()).map((logger) => logger.id);
  }

  getLogs(loggerId: string): string {
    const logger = this.getLogger(loggerId);
    return logger.all();
  }

  getLogger(loggerId: string): LoggerImpl {
    const logger = this.#registry.get(loggerId);
    if (!logger) throw new Error(`unknown logger with id ${loggerId}`);
    return logger;
  }

  disposeLogger(loggerId: string): void {
    const logger = this.getLogger(loggerId);
    logger.dispose();
    this.#registry.delete(loggerId);
    this.notify();
  }

  createLogger(): LoggerImpl {
    const loggerId = this.createID();

    const logger = new LoggerImpl({
      webview: this.dependencies.webview,
      loggerId: loggerId,
    });
    this.#registry.set(loggerId, logger);
    this.notify();
    return logger;
  }

  override dispose(): void {
    super.dispose();
    this.#registry.forEach(value => value.dispose());
  }
}
