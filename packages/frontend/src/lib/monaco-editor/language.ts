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

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  env: 'ini',
  yml: 'yaml',
};

/**
 * Map a file path to a Monaco language id
 * @param path the path of the file
 */
export function getLanguage(path: string): string {
  const filename = path.split('/').pop() ?? '';

  // `.env`, `.env.local`, `foo.env`
  if (filename === '.env' || filename.startsWith('.env.')) return 'ini';

  const extension = filename.split('.').pop() ?? '';
  return LANGUAGE_BY_EXTENSION[extension] ?? extension;
}
