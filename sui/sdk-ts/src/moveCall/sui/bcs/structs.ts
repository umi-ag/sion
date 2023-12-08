import { FieldsWithTypes, Type, compressSuiType } from '../../_framework/util';
import { bcs } from '@mysten/bcs';

/* ============================== BCS =============================== */

export function isBCS(type: Type): boolean {
  type = compressSuiType(type);
  return type === '0x2::bcs::BCS';
}

export interface BCSFields {
  bytes: Array<number>;
}

export class BCS {
  static readonly $typeName = '0x2::bcs::BCS';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('BCS', {
      bytes: bcs.vector(bcs.u8()),
    });
  }

  readonly bytes: Array<number>;

  constructor(bytes: Array<number>) {
    this.bytes = bytes;
  }

  static fromFields(fields: Record<string, any>): BCS {
    return new BCS(fields.bytes.map((item: any) => item));
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): BCS {
    if (!isBCS(item.type)) {
      throw new Error('not a BCS type');
    }
    return new BCS(item.fields.bytes.map((item: any) => item));
  }

  static fromBcs(data: Uint8Array): BCS {
    return BCS.fromFields(BCS.bcs.parse(data));
  }
}
