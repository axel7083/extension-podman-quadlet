/**
 * @author axel7083
 */
import type { PodmanService } from './podman/podman-service';
import type { TelemetryLogger } from '@podman-desktop/api';
import type { PodmanExec } from './podman/podman-exec';

export interface SystemdServiceDependencies {
  podman: PodmanService;
  telemetry: TelemetryLogger;
  podmanExec: PodmanExec;
}

export abstract class SystemdHelper {
  protected constructor(protected dependencies: SystemdServiceDependencies) {}

  protected get podman(): PodmanService {
    return this.dependencies.podman;
  }

  protected logUsage(eventName: string, data?: Record<string, unknown>): void {
    return this.dependencies.telemetry.logUsage(eventName, data);
  }
}
