import { Option } from '../../_dependencies/onchain/0x1/option/structs';
import { ID, UID } from '../../_dependencies/onchain/0x2/object/structs';
import { Table } from '../../_dependencies/onchain/0x2/table/structs';
import { FieldsWithTypes, Type, compressSuiType } from '../../_framework/util';
import { bcs, fromHEX, toHEX } from '@mysten/bcs';
import { SuiClient, SuiParsedData } from '@mysten/sui.js/client';

/* ============================== MembershipRegistry =============================== */

export function isMembershipRegistry(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership_registry::MembershipRegistry'
  );
}

export interface MembershipRegistryFields {
  id: string;
  authenticator: string;
  members: Table;
}

export class MembershipRegistry {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership_registry::MembershipRegistry';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('MembershipRegistry', {
      id: UID.bcs,
      authenticator: bcs
        .bytes(32)
        .transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
      members: Table.bcs,
    });
  }

  readonly id: string;
  readonly authenticator: string;
  readonly members: Table;

  constructor(fields: MembershipRegistryFields) {
    this.id = fields.id;
    this.authenticator = fields.authenticator;
    this.members = fields.members;
  }

  static fromFields(fields: Record<string, any>): MembershipRegistry {
    return new MembershipRegistry({
      id: UID.fromFields(fields.id).id,
      authenticator: `0x${fields.authenticator}`,
      members: Table.fromFields([`address`, `0x2::object::ID`], fields.members),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MembershipRegistry {
    if (!isMembershipRegistry(item.type)) {
      throw new Error('not a MembershipRegistry type');
    }
    return new MembershipRegistry({
      id: item.fields.id.id,
      authenticator: `0x${item.fields.authenticator}`,
      members: Table.fromFieldsWithTypes(item.fields.members),
    });
  }

  static fromBcs(data: Uint8Array): MembershipRegistry {
    return MembershipRegistry.fromFields(MembershipRegistry.bcs.parse(data));
  }

  static fromSuiParsedData(content: SuiParsedData) {
    if (content.dataType !== 'moveObject') {
      throw new Error('not an object');
    }
    if (!isMembershipRegistry(content.type)) {
      throw new Error(`object at ${(content.fields as any).id} is not a MembershipRegistry object`);
    }
    return MembershipRegistry.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<MembershipRegistry> {
    const res = await client.getObject({ id, options: { showContent: true } });
    if (res.error) {
      throw new Error(`error fetching MembershipRegistry object at id ${id}: ${res.error.code}`);
    }
    if (
      res.data?.content?.dataType !== 'moveObject' ||
      !isMembershipRegistry(res.data.content.type)
    ) {
      throw new Error(`object at id ${id} is not a MembershipRegistry object`);
    }
    return MembershipRegistry.fromFieldsWithTypes(res.data.content);
  }
}

/* ============================== ContainsMemberEvent =============================== */

export function isContainsMemberEvent(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership_registry::ContainsMemberEvent'
  );
}

export interface ContainsMemberEventFields {
  authenticator: string;
  member: string;
  membershipId: string | null;
}

export class ContainsMemberEvent {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::membership_registry::ContainsMemberEvent';
  static readonly $numTypeParams = 0;

  static get bcs() {
    return bcs.struct('ContainsMemberEvent', {
      authenticator: bcs
        .bytes(32)
        .transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
      member: bcs
        .bytes(32)
        .transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
      membership_id: Option.bcs(ID.bcs),
    });
  }

  readonly authenticator: string;
  readonly member: string;
  readonly membershipId: string | null;

  constructor(fields: ContainsMemberEventFields) {
    this.authenticator = fields.authenticator;
    this.member = fields.member;
    this.membershipId = fields.membershipId;
  }

  static fromFields(fields: Record<string, any>): ContainsMemberEvent {
    return new ContainsMemberEvent({
      authenticator: `0x${fields.authenticator}`,
      member: `0x${fields.member}`,
      membershipId:
        Option.fromFields<string>(`0x2::object::ID`, fields.membership_id).vec[0] || null,
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ContainsMemberEvent {
    if (!isContainsMemberEvent(item.type)) {
      throw new Error('not a ContainsMemberEvent type');
    }
    return new ContainsMemberEvent({
      authenticator: `0x${item.fields.authenticator}`,
      member: `0x${item.fields.member}`,
      membershipId:
        item.fields.membership_id !== null
          ? Option.fromFieldsWithTypes<string>({
              type: '0x1::option::Option<' + `0x2::object::ID` + '>',
              fields: { vec: [item.fields.membership_id] },
            }).vec[0]
          : null,
    });
  }

  static fromBcs(data: Uint8Array): ContainsMemberEvent {
    return ContainsMemberEvent.fromFields(ContainsMemberEvent.bcs.parse(data));
  }
}
