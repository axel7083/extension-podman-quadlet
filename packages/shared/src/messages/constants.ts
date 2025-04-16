import { getChannel } from './utils';
import { QuadletApi } from '../apis/quadlet-api';
import { DialogApi } from '../apis/dialog-api';

export const noTimeoutChannels: string[] = [
  getChannel(QuadletApi, 'saveIntoMachine'),
  getChannel(DialogApi, 'showWarningMessage'),
  getChannel(DialogApi, 'showInputBox'),
  getChannel(DialogApi, 'showInformationMessage'),
  getChannel(QuadletApi, 'start'),
  getChannel(QuadletApi, 'updateIntoMachine'),
  getChannel(QuadletApi, 'writeIntoMachine'),
];
