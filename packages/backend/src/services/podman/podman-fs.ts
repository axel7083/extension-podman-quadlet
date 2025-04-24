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

import { PodmanSFTP } from '../../utils/remote/podman-sftp';
import type { ProviderContainerConnection, Disposable } from '@podman-desktop/api';
import type { PodmanRemote } from './podman-remote';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path/posix';
import { homedir } from 'node:os';

interface Dependencies {
  remote: PodmanRemote;
}

export class PodmanFS implements Disposable {
  #pools: Map<string, PodmanSFTP>;

  constructor(protected dependencies: Dependencies) {
    this.#pools = new Map();
  }

  dispose(): void {
    this.#pools.forEach((pool: PodmanSFTP) => pool.dispose());
  }

  protected getKey(connection: ProviderContainerConnection): string {
    return `${connection.providerId}:${connection.connection.name}`;
  }

  protected async getPodmanSFTP(connection: ProviderContainerConnection): Promise<PodmanSFTP> {
    const key = this.getKey(connection);
    const podmanSFTP: PodmanSFTP | undefined = this.#pools.get(key);
    if (podmanSFTP) {
      console.log(`[PodmanFS] reusing existing connection: cache hit for ${key}`);
      return podmanSFTP;
    }

    console.log(`[PodmanFS] creating PodmanFS instance for key ${key}`);

    const { URI, Identity } = this.dependencies.remote.getRemoteConnection(connection);
    const url = URL.parse(URI);
    if (!url) throw new Error('cannot parse URI from remote connection: got null');
    if (!Identity) throw new Error('remote connection without identity specified is not supported');

    const privateKey = await readFile(Identity, { encoding: 'utf8' });

    const nPodmanSFTP = new PodmanSFTP({
      host: url.hostname,
      port: parseInt(url.port),
      username: url.username,
      privateKey,
    });
    await nPodmanSFTP.connect();
    this.#pools.set(key, nPodmanSFTP);
    return nPodmanSFTP;
  }

  protected resolve(path: string): string {
    const resolved = path.replace('~', homedir());
  }

  async read(connection: ProviderContainerConnection, path: string): Promise<string> {
    console.log(`[PodmanFS] read action for connection ${connection.connection.name} at path ${path}`);
    const podmanSFTP = await this.getPodmanSFTP(connection);
    return podmanSFTP.read(connection, path);
  }

  async write(connection: ProviderContainerConnection, destination: string, content: string): Promise<void> {
    console.log(`[PodmanFS] write action for connection ${connection.connection.name} at path ${destination}`);
    const podmanSFTP = await this.getPodmanSFTP(connection);
    return podmanSFTP.write(connection, destination, content);
  }

  async rm(connection: ProviderContainerConnection, path: string): Promise<void> {
    console.log(`[PodmanFS] rm action for connection ${connection.connection.name} at path ${path}`);
    const podmanSFTP = await this.getPodmanSFTP(connection);
    return podmanSFTP.rm(connection, path);
  }
}
