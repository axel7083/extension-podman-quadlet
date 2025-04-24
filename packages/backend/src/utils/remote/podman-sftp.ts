import type { Disposable, ProviderContainerConnection } from '@podman-desktop/api';
import type { ConnectConfig } from 'ssh2';
import SftpClient from 'ssh2-sftp-client';
import { dirname } from 'node:path/posix';

export class PodmanSFTP implements Disposable {
  #sshConfig: ConnectConfig;
  #client: SftpClient;
  #connected: boolean = false;

  constructor(sshConfig: ConnectConfig) {
    this.#sshConfig = sshConfig;
    this.#client = new SftpClient();
  }

  dispose(): void {
    this.#client.end().catch(console.error);
  }

  get connected(): boolean {
    return this.#connected;
  }

  async connect(): Promise<void> {
    try {
      await this.#client.connect(this.#sshConfig);
      this.#connected = true;
    } catch (err: unknown) {
      console.error('Something went wrong while trying to connect to podman connection', err);
    }

    this.#client.on('error', () => {
      this.#connected = false;
    });
  }

  protected resolve(path: string): string {
    return path.replace('~', `/home/${this.#sshConfig.username}`);
  }

  async read(connection: ProviderContainerConnection, path: string): Promise<string> {
    return (await this.#client.get(this.resolve(path))) as string;
  }

  async write(connection: ProviderContainerConnection, destination: string, content: string): Promise<void> {
    // resolve path (replace ~ with /home/{username}
    const resolved = this.resolve(destination);

    // create parent directory
    await this.#client.mkdir(dirname(resolved), true);
    // put the file
    await this.#client.put( Buffer.from(content, 'utf8'), resolved);
  }

  async rm(connection: ProviderContainerConnection, path: string): Promise<void> {
    await this.#client.delete(this.resolve(path));
  }
}
