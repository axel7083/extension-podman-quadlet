import type { Disposable, ProviderContainerConnection, Webview } from '@podman-desktop/api';
import type { RemoteConnection } from '../../models/remote-connection';
import type { AsyncInit } from '../../utils/async-init';
import type { PodmanService } from './podman-service';
import type { ProviderService } from '../provider-service';
import { Publisher } from '../../utils/publisher';
import { Messages } from '/@shared/src/messages';

interface Dependencies {
  podman: PodmanService;
  providers: ProviderService;
  webview: Webview;
}

export class PodmanRemote extends Publisher<Array<RemoteConnection>> implements Disposable, AsyncInit {
  #remoteConnections: Map<string, RemoteConnection> | undefined;

  constructor(protected dependencies: Dependencies) {
    super(dependencies.webview, Messages.UPDATE_PODMAN_REMOTES, () => this.all());
  }

  all(): Array<RemoteConnection> {
    return Array.from(this.#remoteConnections?.values() ?? []);
  }

  init(): Promise<void> {
    // listen for any providers update
    this.dependencies.providers.event(this.onProviderUpdate.bind(this));
    return this.collectRemoteConnections();
  }

  protected onProviderUpdate(): void {
    // update the podman remote connections info
    this.collectRemoteConnections().catch(console.error);
  }

  protected async collectRemoteConnections(): Promise<void> {
    const connections = await this.dependencies.podman.getRemoteConnections();
    this.#remoteConnections = new Map<string, RemoteConnection>(
      connections
        .map((connection) => [connection.Name, connection]),
    );
  }

  public isRemote(connection: ProviderContainerConnection): boolean {
    return this.#remoteConnections?.has(connection.connection.name) ?? false;
  }

  public getRemoteConnection(connection: ProviderContainerConnection): RemoteConnection {
    const remote = this.#remoteConnections?.get(connection.connection.name);
    if(!remote) throw new Error(`could not get remote connection for connection ${connection.connection.name}`);
    return remote;
  }

  dispose(): void {
    this.#remoteConnections?.clear();
  }
}
