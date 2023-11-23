import {UID} from "../../_dependencies/onchain/0x2/object/structs";
import {Table} from "../../_dependencies/onchain/0x2/table/structs";
import {bcsOnchain as bcs} from "../../_framework/bcs";
import {FieldsWithTypes, Type} from "../../_framework/util";
import {Encoding} from "@mysten/bcs";
import {SuiClient, SuiParsedData} from "@mysten/sui.js/client";

/* ============================== MembershipRegistry =============================== */

bcs.registerStructType( "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::membership_registry::MembershipRegistry", {
id: `0x2::object::UID`,
authenticator: `address`,
members: `0x2::table::Table<address, 0x2::object::ID>`,
} )

export function isMembershipRegistry(type: Type): boolean { return type === "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::membership_registry::MembershipRegistry"; }

export interface MembershipRegistryFields { id: string; authenticator: string; members: Table }

export class MembershipRegistry { static readonly $typeName = "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::membership_registry::MembershipRegistry"; static readonly $numTypeParams = 0;

 ; readonly id: string; readonly authenticator: string; readonly members: Table

 constructor( fields: MembershipRegistryFields, ) { this.id = fields.id;; this.authenticator = fields.authenticator;; this.members = fields.members; }

 static fromFields( fields: Record<string, any> ): MembershipRegistry { return new MembershipRegistry( { id: UID.fromFields(fields.id).id, authenticator: `0x${fields.authenticator}`, members: Table.fromFields([`address`, `0x2::object::ID`], fields.members) } ) }

 static fromFieldsWithTypes(item: FieldsWithTypes): MembershipRegistry { if (!isMembershipRegistry(item.type)) { throw new Error("not a MembershipRegistry type");

 } return new MembershipRegistry( { id: item.fields.id.id, authenticator: `0x${item.fields.authenticator}`, members: Table.fromFieldsWithTypes(item.fields.members) } ) }

 static fromBcs( data: Uint8Array | string, encoding?: Encoding ): MembershipRegistry { return MembershipRegistry.fromFields( bcs.de([MembershipRegistry.$typeName, ], data, encoding) ) }

 static fromSuiParsedData(content: SuiParsedData) { if (content.dataType !== "moveObject") { throw new Error("not an object"); } if (!isMembershipRegistry(content.type)) { throw new Error(`object at ${(content.fields as any).id} is not a MembershipRegistry object`); } return MembershipRegistry.fromFieldsWithTypes(content); }

 static async fetch(client: SuiClient, id: string ): Promise<MembershipRegistry> { const res = await client.getObject({ id, options: { showContent: true, }, }); if (res.error) { throw new Error(`error fetching MembershipRegistry object at id ${id}: ${res.error.code}`); } if (res.data?.content?.dataType !== "moveObject" || !isMembershipRegistry(res.data.content.type)) { throw new Error(`object at id ${id} is not a MembershipRegistry object`); }
 return MembershipRegistry.fromFieldsWithTypes(res.data.content); }

 }
