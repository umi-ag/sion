import {UID} from "../../_dependencies/onchain/0x2/object/structs";
import {bcsOnchain as bcs} from "../../_framework/bcs";
import {FieldsWithTypes, Type} from "../../_framework/util";
import {Encoding} from "@mysten/bcs";
import {SuiClient, SuiParsedData} from "@mysten/sui.js/client";

/* ============================== VC =============================== */

bcs.registerStructType( "0x773580dec6d115c6cceb88b727e6cc14db88294e8f7294a6caf1cbc2c1f76c7c::vc_old::VC", {
id: `0x2::object::UID`,
created_at: `u64`,
created_by: `address`,
} )

export function isVC(type: Type): boolean { return type === "0x773580dec6d115c6cceb88b727e6cc14db88294e8f7294a6caf1cbc2c1f76c7c::vc_old::VC"; }

export interface VCFields { id: string; createdAt: bigint; createdBy: string }

export class VC { static readonly $typeName = "0x773580dec6d115c6cceb88b727e6cc14db88294e8f7294a6caf1cbc2c1f76c7c::vc_old::VC"; static readonly $numTypeParams = 0;

 ; readonly id: string; readonly createdAt: bigint; readonly createdBy: string

 constructor( fields: VCFields, ) { this.id = fields.id;; this.createdAt = fields.createdAt;; this.createdBy = fields.createdBy; }

 static fromFields( fields: Record<string, any> ): VC { return new VC( { id: UID.fromFields(fields.id).id, createdAt: BigInt(fields.created_at), createdBy: `0x${fields.created_by}` } ) }

 static fromFieldsWithTypes(item: FieldsWithTypes): VC { if (!isVC(item.type)) { throw new Error("not a VC type");

 } return new VC( { id: item.fields.id.id, createdAt: BigInt(item.fields.created_at), createdBy: `0x${item.fields.created_by}` } ) }

 static fromBcs( data: Uint8Array | string, encoding?: Encoding ): VC { return VC.fromFields( bcs.de([VC.$typeName, ], data, encoding) ) }

 static fromSuiParsedData(content: SuiParsedData) { if (content.dataType !== "moveObject") { throw new Error("not an object"); } if (!isVC(content.type)) { throw new Error(`object at ${(content.fields as any).id} is not a VC object`); } return VC.fromFieldsWithTypes(content); }

 static async fetch(client: SuiClient, id: string ): Promise<VC> { const res = await client.getObject({ id, options: { showContent: true, }, }); if (res.error) { throw new Error(`error fetching VC object at id ${id}: ${res.error.code}`); } if (res.data?.content?.dataType !== "moveObject" || !isVC(res.data.content.type)) { throw new Error(`object at id ${id} is not a VC object`); }
 return VC.fromFieldsWithTypes(res.data.content); }

 }
