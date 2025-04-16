/**
 * @author axel7083
 */

export enum TelemetryEvents {
  // quadlet
  /**
   * @deprecated
   */
  QUADLET_CREATE = 'quadlet-create',
  /**
   * @deprecated
   */
  QUADLET_UPDATE = 'quadlet-update',
  QUADLET_WRITE = 'quadlet-write',
  QUADLET_REMOVE = 'quadlet-remove',
  // systemd
  SYSTEMD_START = 'systemd-start',
  SYSTEMD_STOP = 'systemd-stop',
  /**
   * @deprecated
   */
  PODLET_INSTALL = 'podlet-install',
  PODLET_GENERATE = 'podlet-generate',
  PODLET_COMPOSE = 'podlet-compose',
  PODLET_VERSION = 'podlet-version',
}
