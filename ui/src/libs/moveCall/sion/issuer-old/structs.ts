import { String } from '../../_dependencies/onchain/0x1/string/structs';
import { UID } from '../../_dependencies/onchain/0x2/object/structs';
import { Encoding, bcsOnchain as bcs } from '../../_framework/bcs';
import { FieldsWithTypes, Type, compressSuiType } from '../../_framework/util';
import { SuiClient, SuiParsedData } from '@mysten/sui.js/client';

/* ============================== Membership =============================== */

bcs.registerStructType(
  '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::issuer_old::Membership',
  {
    id: `0x2::object::UID`,
    vin: `0x1::string::String`,
    odometer_reading: `u64`,
    fuel_usage: `u64`,
    created_at: `u64`,
    created_by: `address`,
  },
);

export function isMembership(type: Type): boolean {
  type = compressSuiType(type);
  return (
    type ===
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::issuer_old::Membership'
  );
}

export interface MembershipFields {
  id: string;
  vin: string;
  odometerReading: bigint;
  fuelUsage: bigint;
  createdAt: bigint;
  createdBy: string;
}

export class Membership {
  static readonly $typeName =
    '0xeb4c51db47d14a40856b5bf2878c458b190eb4f0abf87cefecffbe3fbba4dfd0::issuer_old::Membership';
  static readonly $numTypeParams = 0;

  readonly id: string;
  readonly vin: string;
  readonly odometerReading: bigint;
  readonly fuelUsage: bigint;
  readonly createdAt: bigint;
  readonly createdBy: string;

  constructor(fields: MembershipFields) {
    this.id = fields.id;
    this.vin = fields.vin;
    this.odometerReading = fields.odometerReading;
    this.fuelUsage = fields.fuelUsage;
    this.createdAt = fields.createdAt;
    this.createdBy = fields.createdBy;
  }

  static fromFields(fields: Record<string, any>): Membership {
    return new Membership({
      id: UID.fromFields(fields.id).id,
      vin: new TextDecoder()
        .decode(Uint8Array.from(String.fromFields(fields.vin).bytes))
        .toString(),
      odometerReading: BigInt(fields.odometer_reading),
      fuelUsage: BigInt(fields.fuel_usage),
      createdAt: BigInt(fields.created_at),
      createdBy: `0x${fields.created_by}`,
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Membership {
    if (!isMembership(item.type)) {
      throw new Error('not a Membership type');
    }
    return new Membership({
      id: item.fields.id.id,
      vin: item.fields.vin,
      odometerReading: BigInt(item.fields.odometer_reading),
      fuelUsage: BigInt(item.fields.fuel_usage),
      createdAt: BigInt(item.fields.created_at),
      createdBy: `0x${item.fields.created_by}`,
    });
  }

  static fromBcs(data: Uint8Array | string, encoding?: Encoding): Membership {
    return Membership.fromFields(bcs.de([Membership.$typeName], data, encoding));
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
