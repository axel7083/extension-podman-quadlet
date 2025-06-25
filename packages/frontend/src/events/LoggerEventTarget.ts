/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { TypedEventTarget } from '/@/events/types';
import type { RpcBrowser, Subscriber } from '/@shared/src/messages/message-proxy';
import { Messages } from '/@shared/src/messages';
import type { LoggerApi } from '/@shared/src/apis/logger-api';

interface LoggerEvents {
  append: CustomEvent<string>;
}

interface Dependencies {
  loggerId: string;
  rpcBrowser: RpcBrowser;
  loggerApi: LoggerApi,
}

const DEFAULT_MAX_LOGS_LENGTH = 200;

export class LoggerEventTarget extends (EventTarget as TypedEventTarget<LoggerEvents>) {
  #accumulator: Array<string> = [];
  #subscriber: Subscriber | undefined;
  #ready: PromiseWithResolvers<Array<string>> = Promise.withResolvers();

  get ready(): Promise<Array<string>> {
    return this.#ready.promise;
  }

  get all(): Array<string> {
    return this.#accumulator;
  }

  constructor(protected dependencies: Dependencies) {
    // eslint-disable-next-line sonarjs/super-invocation
    super();

    console.log('[LoggerEventTarget] constructor', dependencies.loggerId);
  }

  async init(): Promise<void> {
    try {
      this.#accumulator = await this.dependencies.loggerApi.getLogs(this.dependencies.loggerId);
      this.#ready.resolve(this.#accumulator);
    } catch (err: unknown) {
      this.#ready.reject(err);
    }

    this.#subscriber = this.dependencies.rpcBrowser.subscribe(
      Messages.LOGGER_DATA,
      ({ loggerId, value }: { loggerId: string; value: string }) => {
        if (loggerId !== this.dependencies.loggerId) return;

        // add new value
        this.#accumulator.push(value);
        if (this.#accumulator.length > (DEFAULT_MAX_LOGS_LENGTH)) {
          this.#accumulator.shift();
        }

        this.dispatch('append', value);
      },
    );
  }

  private dispatch(eventType: keyof LoggerEvents, details: unknown): void {
    this.dispatchEvent(
      new CustomEvent(eventType, { detail: details }),
    );
  }

  dispose(): void {
    this.#subscriber?.unsubscribe();
    this.#subscriber = undefined;
  }
}
