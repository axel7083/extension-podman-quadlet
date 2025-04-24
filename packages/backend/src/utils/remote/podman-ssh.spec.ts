import { test, expect } from 'vitest';
import { PodmanSSH } from './podman-ssh';
import { readFile } from 'node:fs/promises';

test('debug', async () => {
  const url = new URL('ssh://fedora@51.38.237.223:22/run/user/1000/podman/podman.sock');
  const privateKey = await readFile('/home/axel7083/.ssh/id_ed25519', { encoding: 'utf8' });

  const ssh = new PodmanSSH({
    host: url.hostname,
    port: parseInt(url.port),
    username: url.username,
    privateKey,
  });
  await ssh.connect();

  const { stdout } = await ssh.exec('/usr/libexec/podman/quadlet', {
    args: ['-version'],
  });

  expect(stdout).toStrictEqual('?');
});
