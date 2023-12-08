import { ID, UID } from '../../_dependencies/onchain/0x2/object/structs';
import { FieldsWithTypes, Type, compressSuiType } from '../../_framework/util';
import { bcs, fromHEX, toHEX } from '@mysten/bcs';
import { SuiClient, SuiParsedData } from '@mysten/sui.js/client';

/* ============================== MembershipPointer =============================== */

export function isMembershipPointer(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership_pointer::MembershipPointer'
  );
}

export interface MembershipPointerFields {
  id: string;
  membershipId: string;
  authenticator: string;
  subject: string;
}

export class MembershipPointer {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership_pointer::MembershipPointer';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('MembershipPointer', {
      id: UID.bcs,
      membership_id: ID.bcs,
      authenticator: bcs
        .bytes(32)
        .transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
      subject: bcs
        .bytes(32)
        .transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
    });
  }

  readonly id: string;
  readonly membershipId: string;
  readonly authenticator: string;
  readonly subject: string;

  constructor(fields: MembershipPointerFields) {
    this.id = fields.id;
    this.membershipId = fields.membershipId;
    this.authenticator = fields.authenticator;
    this.subject = fields.subject;
  }

  static fromFields(fields: Record<string, any>): MembershipPointer {
    return new MembershipPointer({
      id: UID.fromFields(fields.id).id,
      membershipId: ID.fromFields(fields.membership_id).bytes,
      authenticator: `0x${fields.authenticator}`,
      subject: `0x${fields.subject}`,
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MembershipPointer {
    if (!isMembershipPointer(item.type)) {
      throw new Error('not a MembershipPointer type');
    }
    return new MembershipPointer({
      id: item.fields.id.id,
      membershipId: item.fields.membership_id,
      authenticator: `0x${item.fields.authenticator}`,
      subject: `0x${item.fields.subject}`,
    });
  }

  static fromBcs(data: Uint8Array): MembershipPointer {
    return MembershipPointer.fromFields(MembershipPointer.bcs.parse(data));
  }

  static fromSuiParsedData(content: SuiParsedData) {
    if (content.dataType !== 'moveObject') {
      throw new Error('not an object');
    }
    if (!isMembershipPointer(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a MembershipPointer object`);
    }
    return MembershipPointer.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<MembershipPointer> {
    const res = await client.getObject({ id, options: { showContent: true } });
    if (res.error) {
      throw new Error(`error fetching MembershipPointer object at id ${id}: ${res.error.code}`);
    }
    if (
      res.data?.content?.dataType !== 'moveObject' ||
      !isMembershipPointer(res.data.content.type)
    ) {
      throw new Error(`object at id ${id} is not a MembershipPointer object`);
    }
    return MembershipPointer.fromFieldsWithTypes(res.data.content);
  }
}
