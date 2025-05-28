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
import type { Tab } from '/@shared/src/models/Tab';
import { Publisher } from '../utils/publisher';
import type { AsyncInit } from '../utils/async-init';
import type { LoggerService } from './logger-service';
import type { Webview } from '@podman-desktop/api';
import { Messages } from '/@shared/src/messages';

const QUADLETS_TAB: Tab = {
  id: 'quadlets',
  title: 'Quadlets',
  locked: true,
  body: {
    route: '/',
  },
};

interface Dependencies {
  webview: Webview;
  loggers: LoggerService;
}

export class TabsService extends Publisher<Array<Tab>> implements AsyncInit {
  #tabs: Map<string, Tab> = new Map<string, Tab>();

  constructor(protected dependencies: Dependencies) {
    super(dependencies.webview, Messages.UPDATE_TABS, () => this.all());
  }

  all(): Array<Tab> {
    return [
      ...Array.from(this.#tabs.values()),
      ...this.getLoggersTabs(),
    ];
  }

  protected getLoggersTabs(): Array<Tab> {
    return this.dependencies.loggers.all().map((loggerId) => ({
      title: loggerId,
      id: loggerId,
      locked: false,
      body: {
        route: `/logger/${loggerId}`,
      },
    }));
  }

  async init(): Promise<void> {
    this.#tabs.set(QUADLETS_TAB.id, QUADLETS_TAB);
  }

  register(tab: Tab): void {
    this.#tabs.set(tab.id, tab);
    this.notify();
  }

  unregister(tabId: string): void {
    this.#tabs.delete(tabId);
    this.notify();
  }

  override dispose(): void {
    super.dispose();
    this.#tabs.clear();
  }
}
