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
import path, { join } from 'node:path';
import { builtinModules } from 'node:module';
import { defineConfig, type PluginOption } from 'vite';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const PACKAGE_ROOT = __dirname;

/**
 * https://github.com/vitejs/vite/issues/14289#issuecomment-2420109786
 */
function nativeFilesPlugin(): PluginOption {
  const files = new Map<string, { readonly fileName: string; readonly fileContent: Buffer }>();

  return {
    name: 'node-binaries-plugin',
    async load(id) {
      if (!id.endsWith('.node')) {
        return null;
      }

      const fileContent = await readFile(id);
      const hash = createHash('sha256').update(fileContent).digest('hex').slice(0, 8);
      const fileName = `${path.basename(id, '.node')}.${hash}.node`;
      files.set(id, { fileName, fileContent });

      return `export default require('./${fileName}');`;
    },

    generateBundle(_, bundle) {
      for (const [id, { fileName, fileContent }] of files.entries()) {
        this.emitFile({ type: 'asset', fileName, source: fileContent });
        delete bundle[id];
      }
    },
  };
}

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  resolve: {
    alias: {
      '/@/': join(PACKAGE_ROOT, 'src') + '/',
      '/@gen/': join(PACKAGE_ROOT, 'src-generated') + '/',
      '/@shared/': join(PACKAGE_ROOT, '../shared') + '/',
    },
  },
  plugins: [
    nativeFilesPlugin(),
  ],
  build: {
    sourcemap: 'inline',
    target: 'esnext',
    outDir: 'dist',
    assetsDir: '.',
    minify: process.env.MODE === 'production' ? 'esbuild' : false,
    lib: {
      entry: 'src/extension.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['@podman-desktop/api', ...builtinModules.flatMap(p => [p, `node:${p}`])],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
});
