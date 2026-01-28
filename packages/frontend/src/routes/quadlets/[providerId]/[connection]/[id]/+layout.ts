/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
import type { LayoutLoad } from './$types';
import { quadletsInfo } from '/@/stores/quadlets';
import { get } from 'svelte/store';
import type { QuadletInfo } from '/@shared/src/models/quadlet-info';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params }): Promise<{ quadlet: QuadletInfo }> => {
  const quadlet = get(quadletsInfo).find(
    quadlet =>
      quadlet.id === params.id &&
      quadlet.connection.name === params.connection &&
      quadlet.connection.providerId === params.providerId,
  );

  if(!quadlet) {
    error(404, `quadlet not found`);
  }

  return {
    quadlet: quadlet,
  };
};
