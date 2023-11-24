import { Encoding, bcsOnchain as bcs } from '../../_framework/bcs';
import { FieldsWithTypes, Type, compressSuiType } from '../../_framework/util';

/* ============================== Groth16VerificationEvent =============================== */

bcs.registerStructType(
  '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::verifier::Groth16VerificationEvent',
  {
    vk: `vector<u8>`,
    public_inputs: `vector<u8>`,
    proof: `vector<u8>`,
    is_verified: `bool`,
  },
);

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

  static fromBcs(data: Uint8Array | string, encoding?: Encoding): Groth16VerificationEvent {
    return Groth16VerificationEvent.fromFields(
      bcs.de([Groth16VerificationEvent.$typeName], data, encoding),
    );
  }
}
