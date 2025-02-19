import { Parser } from './iparser';
import { QuadletType } from '/@shared/src/utils/quadlet-type';
import { basename } from 'node:path/posix';

export class QuadletExtensionParser extends Parser<string, QuadletType> {
  constructor(path: string) {
    super(path);
  }

  override parse(): QuadletType {
    const extension = basename(this.content).split('.').pop();
    const type: QuadletType | undefined = Object.values(QuadletType).find(type => extension === type.toLowerCase());
    if (!type) throw new Error(`cannot find quadlet type from path: ${this.content}`);

    return type;
  }
}
