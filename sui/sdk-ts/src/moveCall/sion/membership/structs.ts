import { String } from '../../_dependencies/onchain/0x1/string/structs';
import { UID } from '../../_dependencies/onchain/0x2/object/structs';
import { Table } from '../../_dependencies/onchain/0x2/table/structs';
import { FieldsWithTypes, Type, compressSuiType } from '../../_framework/util';
import { bcs, fromHEX, toHEX } from '@mysten/bcs';
import { SuiClient, SuiParsedData } from '@mysten/sui.js/client';

/* ============================== Membership =============================== */

export function isMembership(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership::Membership'
  );
}

export interface MembershipFields {
  id: string;
  authenticator: string;
  subject: string;
  createdAt: bigint;
  claimsKeyToDigest: Table;
  claimsDigestToKey: Table;
}

export class Membership {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership::Membership';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('Membership', {
      id: UID.bcs,
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
      created_at: bcs.u64(),
      claims_key_to_digest: Table.bcs,
      claims_digest_to_key: Table.bcs,
    });
  }

  readonly id: string;
  readonly authenticator: string;
  readonly subject: string;
  readonly createdAt: bigint;
  readonly claimsKeyToDigest: Table;
  readonly claimsDigestToKey: Table;

  constructor(fields: MembershipFields) {
    this.id = fields.id;
    this.authenticator = fields.authenticator;
    this.subject = fields.subject;
    this.createdAt = fields.createdAt;
    this.claimsKeyToDigest = fields.claimsKeyToDigest;
    this.claimsDigestToKey = fields.claimsDigestToKey;
  }

  static fromFields(fields: Record<string, any>): Membership {
    return new Membership({
      id: UID.fromFields(fields.id).id,
      authenticator: `0x${fields.authenticator}`,
      subject: `0x${fields.subject}`,
      createdAt: BigInt(fields.created_at),
      claimsKeyToDigest: Table.fromFields(
        [`0x1::string::String`, `vector<u8>`],
        fields.claims_key_to_digest,
      ),
      claimsDigestToKey: Table.fromFields(
        [`vector<u8>`, `0x1::string::String`],
        fields.claims_digest_to_key,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Membership {
    if (!isMembership(item.type)) {
      throw new Error('not a Membership type');
    }
    return new Membership({
      id: item.fields.id.id,
      authenticator: `0x${item.fields.authenticator}`,
      subject: `0x${item.fields.subject}`,
      createdAt: BigInt(item.fields.created_at),
      claimsKeyToDigest: Table.fromFieldsWithTypes(item.fields.claims_key_to_digest),
      claimsDigestToKey: Table.fromFieldsWithTypes(item.fields.claims_digest_to_key),
    });
  }

  static fromBcs(data: Uint8Array): Membership {
    return Membership.fromFields(Membership.bcs.parse(data));
  }

  static fromSuiParsedData(content: SuiParsedData) {
    if (content.dataType !== 'moveObject') {
      throw new Error('not an object');
    }
    if (!isMembership(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a Membership object`);
    }
    return Membership.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<Membership> {
    const res = await client.getObject({ id, options: { showContent: true } });
    if (res.error) {
      throw new Error(`error fetching Membership object at id ${id}: ${res.error.code}`);
    }
    if (res.data?.content?.dataType !== 'moveObject' || !isMembership(res.data.content.type)) {
      throw new Error(`object at id ${id} is not a Membership object`);
    }
    return Membership.fromFieldsWithTypes(res.data.content);
  }
}

/* ============================== ContainsClaimEvent =============================== */

export function isContainsClaimEvent(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership::ContainsClaimEvent'
  );
}

export interface ContainsClaimEventFields {
  authenticator: string;
  subject: string;
  claimKey: string;
  claimDigest: Array<number>;
  isVerified: boolean;
}

export class ContainsClaimEvent {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership::ContainsClaimEvent';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('ContainsClaimEvent', {
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
      claim_key: String.bcs,
      claim_digest: bcs.vector(bcs.u8()),
      is_verified: bcs.bool(),
    });
  }

  readonly authenticator: string;
  readonly subject: string;
  readonly claimKey: string;
  readonly claimDigest: Array<number>;
  readonly isVerified: boolean;

  constructor(fields: ContainsClaimEventFields) {
    this.authenticator = fields.authenticator;
    this.subject = fields.subject;
    this.claimKey = fields.claimKey;
    this.claimDigest = fields.claimDigest;
    this.isVerified = fields.isVerified;
  }

  static fromFields(fields: Record<string, any>): ContainsClaimEvent {
    return new ContainsClaimEvent({
      authenticator: `0x${fields.authenticator}`,
      subject: `0x${fields.subject}`,
      claimKey: new TextDecoder()
        .decode(Uint8Array.from(String.fromFields(fields.claim_key).bytes))
        .toString(),
      claimDigest: fields.claim_digest.map((item: any) => item),
      isVerified: fields.is_verified,
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ContainsClaimEvent {
    if (!isContainsClaimEvent(item.type)) {
      throw new Error('not a ContainsClaimEvent type');
    }
    return new ContainsClaimEvent({
      authenticator: `0x${item.fields.authenticator}`,
      subject: `0x${item.fields.subject}`,
      claimKey: item.fields.claim_key,
      claimDigest: item.fields.claim_digest.map((item: any) => item),
      isVerified: item.fields.is_verified,
    });
  }

  static fromBcs(data: Uint8Array): ContainsClaimEvent {
    return ContainsClaimEvent.fromFields(ContainsClaimEvent.bcs.parse(data));
  }
}

/* ============================== BoundCheckEvent =============================== */

export function isBoundCheckEvent(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership::BoundCheckEvent'
  );
}

export interface BoundCheckEventFields {
  authenticator: string;
  subject: string;
  claimKey: string;
  claimDigest: Array<number>;
  gteBound: bigint;
  ltBound: bigint;
  isVerified: boolean;
}

export class BoundCheckEvent {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership::BoundCheckEvent';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('BoundCheckEvent', {
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
      claim_key: String.bcs,
      claim_digest: bcs.vector(bcs.u8()),
      gte_bound: bcs.u64(),
      lt_bound: bcs.u64(),
      is_verified: bcs.bool(),
    });
  }

  readonly authenticator: string;
  readonly subject: string;
  readonly claimKey: string;
  readonly claimDigest: Array<number>;
  readonly gteBound: bigint;
  readonly ltBound: bigint;
  readonly isVerified: boolean;

  constructor(fields: BoundCheckEventFields) {
    this.authenticator = fields.authenticator;
    this.subject = fields.subject;
    this.claimKey = fields.claimKey;
    this.claimDigest = fields.claimDigest;
    this.gteBound = fields.gteBound;
    this.ltBound = fields.ltBound;
    this.isVerified = fields.isVerified;
  }

  static fromFields(fields: Record<string, any>): BoundCheckEvent {
    return new BoundCheckEvent({
      authenticator: `0x${fields.authenticator}`,
      subject: `0x${fields.subject}`,
      claimKey: new TextDecoder()
        .decode(Uint8Array.from(String.fromFields(fields.claim_key).bytes))
        .toString(),
      claimDigest: fields.claim_digest.map((item: any) => item),
      gteBound: BigInt(fields.gte_bound),
      ltBound: BigInt(fields.lt_bound),
      isVerified: fields.is_verified,
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): BoundCheckEvent {
    if (!isBoundCheckEvent(item.type)) {
      throw new Error('not a BoundCheckEvent type');
    }
    return new BoundCheckEvent({
      authenticator: `0x${item.fields.authenticator}`,
      subject: `0x${item.fields.subject}`,
      claimKey: item.fields.claim_key,
      claimDigest: item.fields.claim_digest.map((item: any) => item),
      gteBound: BigInt(item.fields.gte_bound),
      ltBound: BigInt(item.fields.lt_bound),
      isVerified: item.fields.is_verified,
    });
  }

  static fromBcs(data: Uint8Array): BoundCheckEvent {
    return BoundCheckEvent.fromFields(BoundCheckEvent.bcs.parse(data));
  }
}
