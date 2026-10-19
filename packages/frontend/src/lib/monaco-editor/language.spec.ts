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

import { expect, test } from 'vitest';
import { getLanguage } from '/@/lib/monaco-editor/language';

test.each([
  ['/mnt/foo/app.env', 'ini'],
  ['/mnt/foo/.env', 'ini'],
  ['/mnt/foo/.env.local', 'ini'],
  ['/mnt/foo/bar.yml', 'yaml'],
  ['/mnt/foo/bar.yaml', 'yaml'],
  ['/mnt/foo.d/bar.container', 'container'],
])('getLanguage(%s) should be %s', (path, expected) => {
  expect(getLanguage(path)).toBe(expected);
});
