import {UID} from "../../_dependencies/onchain/0x2/object/structs";
import {Table} from "../../_dependencies/onchain/0x2/table/structs";
import {bcsOnchain as bcs} from "../../_framework/bcs";
import {FieldsWithTypes, Type} from "../../_framework/util";
import {Encoding} from "@mysten/bcs";
import {SuiClient, SuiParsedData} from "@mysten/sui.js/client";

/* ============================== VC =============================== */

bcs.registerStructType( "0xb905cffb978c84e2fd6c490f00a4c4659d0ee9eb25f77ae90c9f10caff9d3115::vc::VC", {
id: `0x2::object::UID`,
authenticator: `address`,
subject: `address`,
created_at: `u64`,
claims_key_to_digest: `0x2::table::Table<0x1::string::String, vector<u8>>`,
claims_digest_to_key: `0x2::table::Table<vector<u8>, 0x1::string::String>`,
} )

export function isVC(type: Type): boolean { return type === "0xb905cffb978c84e2fd6c490f00a4c4659d0ee9eb25f77ae90c9f10caff9d3115::vc::VC"; }

export interface VCFields { id: string; authenticator: string; subject: string; createdAt: bigint; claimsKeyToDigest: Table; claimsDigestToKey: Table }

export class VC { static readonly $typeName = "0xb905cffb978c84e2fd6c490f00a4c4659d0ee9eb25f77ae90c9f10caff9d3115::vc::VC"; static readonly $numTypeParams = 0;

 ; readonly id: string; readonly authenticator: string; readonly subject: string; readonly createdAt: bigint; readonly claimsKeyToDigest: Table; readonly claimsDigestToKey: Table

 constructor( fields: VCFields, ) { this.id = fields.id;; this.authenticator = fields.authenticator;; this.subject = fields.subject;; this.createdAt = fields.createdAt;; this.claimsKeyToDigest = fields.claimsKeyToDigest;; this.claimsDigestToKey = fields.claimsDigestToKey; }

 static fromFields( fields: Record<string, any> ): VC { return new VC( { id: UID.fromFields(fields.id).id, authenticator: `0x${fields.authenticator}`, subject: `0x${fields.subject}`, createdAt: BigInt(fields.created_at), claimsKeyToDigest: Table.fromFields([`0x1::string::String`, `vector<u8>`], fields.claims_key_to_digest), claimsDigestToKey: Table.fromFields([`vector<u8>`, `0x1::string::String`], fields.claims_digest_to_key) } ) }

 static fromFieldsWithTypes(item: FieldsWithTypes): VC { if (!isVC(item.type)) { throw new Error("not a VC type");

 } return new VC( { id: item.fields.id.id, authenticator: `0x${item.fields.authenticator}`, subject: `0x${item.fields.subject}`, createdAt: BigInt(item.fields.created_at), claimsKeyToDigest: Table.fromFieldsWithTypes(item.fields.claims_key_to_digest), claimsDigestToKey: Table.fromFieldsWithTypes(item.fields.claims_digest_to_key) } ) }

 static fromBcs( data: Uint8Array | string, encoding?: Encoding ): VC { return VC.fromFields( bcs.de([VC.$typeName, ], data, encoding) ) }

 static fromSuiParsedData(content: SuiParsedData) { if (content.dataType !== "moveObject") { throw new Error("not an object"); } if (!isVC(content.type)) { throw new Error(`object at ${(content.fields as any).id} is not a VC object`); } return VC.fromFieldsWithTypes(content); }

 static async fetch(client: SuiClient, id: string ): Promise<VC> { const res = await client.getObject({ id, options: { showContent: true, }, }); if (res.error) { throw new Error(`error fetching VC object at id ${id}: ${res.error.code}`); } if (res.data?.content?.dataType !== "moveObject" || !isVC(res.data.content.type)) { throw new Error(`object at id ${id} is not a VC object`); }
 return VC.fromFieldsWithTypes(res.data.content); }

 }
