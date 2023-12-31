import { FieldsWithTypes, Type, compressSuiType } from '../../_framework/util';
import { bcs } from '@mysten/bcs';

/* ============================== Groth16VerificationEvent =============================== */

export function isGroth16VerificationEvent(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::verifier::Groth16VerificationEvent'
  );
}

export interface Groth16VerificationEventFields {
  vk: Array<number>;
  publicInputs: Array<number>;
  proof: Array<number>;
  isVerified: boolean;
}

export class Groth16VerificationEvent {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::verifier::Groth16VerificationEvent';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('Groth16VerificationEvent', {
      vk: bcs.vector(bcs.u8()),
      public_inputs: bcs.vector(bcs.u8()),
      proof: bcs.vector(bcs.u8()),
      is_verified: bcs.bool(),
    });
  }

  readonly vk: Array<number>;
  readonly publicInputs: Array<number>;
  readonly proof: Array<number>;
  readonly isVerified: boolean;

  constructor(fields: Groth16VerificationEventFields) {
    this.vk = fields.vk;
    this.publicInputs = fields.publicInputs;
    this.proof = fields.proof;
    this.isVerified = fields.isVerified;
  }

  static fromFields(fields: Record<string, any>): Groth16VerificationEvent {
    return new Groth16VerificationEvent({
      vk: fields.vk.map((item: any) => item),
      publicInputs: fields.public_inputs.map((item: any) => item),
      proof: fields.proof.map((item: any) => item),
      isVerified: fields.is_verified,
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Groth16VerificationEvent {
    if (!isGroth16VerificationEvent(item.type)) {
      throw new Error('not a Groth16VerificationEvent type');
    }
    return new Groth16VerificationEvent({
      vk: item.fields.vk.map((item: any) => item),
      publicInputs: item.fields.public_inputs.map((item: any) => item),
      proof: item.fields.proof.map((item: any) => item),
      isVerified: item.fields.is_verified,
    });
  }

  static fromBcs(data: Uint8Array): Groth16VerificationEvent {
    return Groth16VerificationEvent.fromFields(Groth16VerificationEvent.bcs.parse(data));
  }
}
