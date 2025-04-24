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

import type {
  ProviderContainerConnection,
  Disposable,
  Logger,
  CancellationToken,
  RunResult, RunError,
} from '@podman-desktop/api';
import { PodmanSSH } from '../../utils/remote/podman-ssh';
import type { PodmanRemote } from './podman-remote';
import { readFile } from 'node:fs/promises';
import { isRunError } from '../../utils/run-error';

interface Dependencies {
  remote: PodmanRemote;
}

/**
 * PodmanExec is a class holding a pool of {@link PodmanSSH} instance
 * allowing to exec to a podman connection (could be a machine locally, or a remote machine in the cloud)
 */
export class PodmanExec implements Disposable {
  #pools: Map<string, PodmanSSH>;

  constructor(protected dependencies: Dependencies) {
    this.#pools = new Map();
  }

  dispose(): void {
    this.#pools.forEach((pool: PodmanSSH) => pool.dispose());
  }

  protected getKey(connection: ProviderContainerConnection): string {
    return `${connection.providerId}:${connection.connection.name}`;
  }

  /**
   * TODO: factorise with {@link PodmanFS}
   * @param connection
   * @protected
   */
  protected async getPodmanSSH(connection: ProviderContainerConnection): Promise<PodmanSSH> {
    const key = this.getKey(connection);
    const podmanSSH: PodmanSSH | undefined = this.#pools.get(key);
    if (podmanSSH) {
      console.log(`[PodmanExec] reusing existing connection: cache hit for ${key}`);
      return podmanSSH;
    }

    console.log(`[PodmanExec] creating PodmanSSH instance for key ${key}`);

    const { URI, Identity } = this.dependencies.remote.getRemoteConnection(connection);
    const url = URL.parse(URI);
    if (!url) throw new Error('cannot parse URI from remote connection: got null');
    if (!Identity) throw new Error('remote connection without identity specified is not supported');

    const privateKey = await readFile(Identity, { encoding: 'utf8' });

    const nPodmanSSH = new PodmanSSH({
      host: url.hostname,
      port: parseInt(url.port),
      username: url.username,
      privateKey,
    });
    await nPodmanSSH.connect();
    this.#pools.set(key, nPodmanSSH);
    return nPodmanSSH;
  }

  async exec(
    connection: ProviderContainerConnection,
    command: string,
    options: {
    args: string[];
    logger?: Logger;
    token?: CancellationToken;
    env?: Record<string, string>;
  }): Promise<RunResult> {
    const podmanSSH = await this.getPodmanSSH(connection);
    return podmanSSH.exec(command, options);
  }

  async systemctlExec(options: {
    connection: ProviderContainerConnection;
    args: string[];
    logger?: Logger;
    token?: CancellationToken;
    env?: Record<string, string>;
  }): Promise<RunResult | RunError> {
    return this.exec(options.connection, 'systemctl', options)
      .catch((err: unknown) => {
      // check err is an RunError
      if (isRunError(err)) return err;
      throw err;
    });
  }
}
