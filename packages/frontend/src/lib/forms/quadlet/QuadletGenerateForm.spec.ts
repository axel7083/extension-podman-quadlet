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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, type RenderResult } from '@testing-library/svelte';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import QuadletGenerateForm from '/@/lib/forms/quadlet/QuadletGenerateForm.svelte';
import * as connectionStore from '/@store/connections';
import { readable } from 'svelte/store';
import type { ProviderContainerConnectionDetailedInfo } from '/@shared/src/models/provider-container-connection-detailed-info';
import { containerAPI, podletAPI } from '/@/api/client';
import { QuadletType } from '/@shared/src/utils/quadlet-type';
import type { Component, ComponentProps } from 'svelte';

// mock clients
vi.mock('/@/api/client', () => ({
  containerAPI: {
    all: vi.fn(),
  },
  providerAPI: {
    all: vi.fn(),
  },
  podletAPI: {
    generate: vi.fn(),
  },
}));
// mock stores
vi.mock('/@store/connections');
// do not render monaco editor
vi.mock('/@/lib/monaco-editor/QuadletEditor.svelte');

// ui object
const WSL_PROVIDER_DETAILED_INFO: ProviderContainerConnectionDetailedInfo = {
  providerId: 'podman',
  name: 'podman-machine',
  vmType: 'WSL',
  status: 'started',
};

const PODLET_GENERATE_RUN_RESULT: string = `
  # dummy quadlet
`;

beforeEach(() => {
  vi.mocked(connectionStore).providerConnectionsInfo = readable([WSL_PROVIDER_DETAILED_INFO]);
  vi.mocked(containerAPI.all).mockResolvedValue([]);
  vi.mocked(podletAPI.generate).mockResolvedValue(PODLET_GENERATE_RUN_RESULT);
});

describe('Step options', () => {
  test('expect cancel to call close', async () => {
    const closeMock = vi.fn();
    const { getByRole } = render(QuadletGenerateForm, {
      providerId: WSL_PROVIDER_DETAILED_INFO.providerId,
      connection: WSL_PROVIDER_DETAILED_INFO.name,
      loading: false,
      close: closeMock,
    });

    const cancel = getByRole('button', { name: 'Cancel' });
    expect(cancel).toBeEnabled();

    await fireEvent.click(cancel);
    expect(closeMock).toHaveBeenCalled();
  });

  test('expect generate to be disabled by default', async () => {
    const { getByRole } = render(QuadletGenerateForm, {
      providerId: WSL_PROVIDER_DETAILED_INFO.providerId,
      connection: WSL_PROVIDER_DETAILED_INFO.name,
      loading: false,
      close: vi.fn(),
    });

    const generate = getByRole('button', { name: 'Generate' });
    expect(generate).toBeDisabled();
  });

  test('expect generate to be enabled if provider and resource are defined', async () => {
    const { getByRole } = render(QuadletGenerateForm, {
      providerId: WSL_PROVIDER_DETAILED_INFO.providerId,
      connection: WSL_PROVIDER_DETAILED_INFO.name,
      resourceId: 'dummy-resource-id',
      loading: false,
      close: vi.fn(),
    });

    const generate: HTMLButtonElement = await vi.waitFor(() => {
      const element = getByRole('button', { name: 'Generate' });
      expect(element).toBeInstanceOf(HTMLButtonElement);
      expect(element).toBeEnabled();
      return element as HTMLButtonElement;
    });

    await fireEvent.click(generate);

    await vi.waitFor(() => {
      expect(podletAPI.generate).toHaveBeenCalledWith({
        connection: WSL_PROVIDER_DETAILED_INFO,
        resourceId: 'dummy-resource-id',
        type: QuadletType.CONTAINER,
      });
    });
  });
});

describe('validating filename', () => {
  let renderResult: RenderResult<Component<ComponentProps<typeof QuadletGenerateForm>>>;

  /**
   * Go directly to step 2
   */
  beforeEach(async () => {
    renderResult = render(QuadletGenerateForm, {
      providerId: WSL_PROVIDER_DETAILED_INFO.providerId,
      connection: WSL_PROVIDER_DETAILED_INFO.name,
      resourceId: 'dummy-resource-id',
      loading: false,
      close: vi.fn(),
    });

    const generate: HTMLButtonElement = await vi.waitFor(() => {
      const element = renderResult.getByRole('button', { name: 'Generate' });
      expect(element).toBeInstanceOf(HTMLButtonElement);
      expect(element).toBeEnabled();
      return element as HTMLButtonElement;
    });

    await fireEvent.click(generate);

    const loadIntoMachine: HTMLButtonElement = await vi.waitFor(() => {
      const element = renderResult.getByRole('button', { name: 'Load into machine' });
      expect(element).toBeInstanceOf(HTMLButtonElement);
      return element as HTMLButtonElement;
    });

    expect(loadIntoMachine).toBeDefined();
  });

  test('expect button to be disabled by default', async () => {
    const loadIntoMachine = renderResult.getByRole('button', { name: 'Load into machine' });

    expect(loadIntoMachine).toBeDisabled();
  });

  test('invalid non-empty filename should display an error', async () => {
    const input = renderResult.getByRole('textbox', { name: 'Quadlet filename' });
    expect(input).toBeDefined();

    await fireEvent.input(input, { target: { value: 'hello' } });

    await vi.waitFor(() => {
      const alert = renderResult.getByRole('alert');
      expect(alert).toHaveTextContent('Quadlet filename should be <name>.container');
    });
  });

  test('valid filename should not display an error', async () => {
    const input = renderResult.getByRole('textbox', { name: 'Quadlet filename' });
    expect(input).toBeDefined();

    await fireEvent.input(input, { target: { value: 'hello' } });

    // ensure it exists
    await vi.waitFor(() => {
      const alert = renderResult.queryByRole('alert');
      expect(alert).toBeDefined();
    });

    // fill the input with a valid value (it replace any existing)
    await fireEvent.input(input, { target: { value: 'hello.container' } });
    await vi.waitFor(() => {
      const alert = renderResult.queryByRole('alert');
      expect(alert).toBeNull();
    });
  });
});
