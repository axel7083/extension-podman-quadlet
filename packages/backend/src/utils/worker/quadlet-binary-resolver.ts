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

import type { CancellationToken, Logger, RunResult } from '@podman-desktop/api';
import { isAbsolute, join } from 'node:path/posix';

export const PODMAN_SYSTEMD_GENERATOR = 'podman-system-generator';

export interface ExecOptions {
  args?: string[];
  logger?: Logger;
  token?: CancellationToken;
  env?: Record<string, string>;
}

export interface QuadletBinaryExecutor {
  exec(command: string, options?: ExecOptions): Promise<RunResult>;
  realPath(path: string): Promise<string>;
}

export interface QuadletBinaryResolverOptions { token?: CancellationToken; logger?: Logger }

export class QuadletBinaryResolver {
  constructor(private executor: QuadletBinaryExecutor) {}

  async resolve(options?: QuadletBinaryResolverOptions): Promise<string> {
    options?.logger?.log('getting quadlet binary using systemd-path');
    const result = await this.executor.exec('systemd-path', {
      args: ['systemd-system-generator'],
      token: options?.token,
    });

    const systemdGeneratorDirectory = result.stdout.trim();
    if (!isAbsolute(systemdGeneratorDirectory))
      throw new Error(`systemd-system-generator directory is not absolute, received "${systemdGeneratorDirectory}".`);

    const symlink = join(systemdGeneratorDirectory, PODMAN_SYSTEMD_GENERATOR);
    const path = await this.executor.realPath(symlink);
    return path;
  }
}
