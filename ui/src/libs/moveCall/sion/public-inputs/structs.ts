import { FieldsWithTypes, Type, compressSuiType } from '../../_framework/util';
import { bcs } from '@mysten/bcs';

/* ============================== PublicInputsArgs =============================== */

export function isPublicInputsArgs(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::public_inputs::PublicInputsArgs'
  );
}

export interface PublicInputsArgsFields {
  expectedDigest: Array<number>;
  min: bigint;
  max: bigint;
}

export class PublicInputsArgs {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::public_inputs::PublicInputsArgs';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('PublicInputsArgs', {
      expected_digest: bcs.vector(bcs.u8()),
      min: bcs.u64(),
      max: bcs.u64(),
    });
  }

  readonly expectedDigest: Array<number>;
  readonly min: bigint;
  readonly max: bigint;

  constructor(fields: PublicInputsArgsFields) {
    this.expectedDigest = fields.expectedDigest;
    this.min = fields.min;
    this.max = fields.max;
  }

  static fromFields(fields: Record<string, any>): PublicInputsArgs {
    return new PublicInputsArgs({
      expectedDigest: fields.expected_digest.map((item: any) => item),
      min: BigInt(fields.min),
      max: BigInt(fields.max),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PublicInputsArgs {
    if (!isPublicInputsArgs(item.type)) {
      throw new Error('not a PublicInputsArgs type');
    }
    return new PublicInputsArgs({
      expectedDigest: item.fields.expected_digest.map((item: any) => item),
      min: BigInt(item.fields.min),
      max: BigInt(item.fields.max),
    });
  }

  static fromBcs(data: Uint8Array): PublicInputsArgs {
    return PublicInputsArgs.fromFields(PublicInputsArgs.bcs.parse(data));
  }
}
