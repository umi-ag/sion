import {String} from "../../_dependencies/onchain/0x1/string/structs";
import {UID} from "../../_dependencies/onchain/0x2/object/structs";
import {Table} from "../../_dependencies/onchain/0x2/table/structs";
import {bcsOnchain as bcs} from "../../_framework/bcs";
import {FieldsWithTypes, Type} from "../../_framework/util";
import {Encoding} from "@mysten/bcs";
import {SuiClient, SuiParsedData} from "@mysten/sui.js/client";

/* ============================== VC =============================== */

bcs.registerStructType( "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::VC", {
id: `0x2::object::UID`,
authenticator: `address`,
subject: `address`,
created_at: `u64`,
claims_key_to_digest: `0x2::table::Table<0x1::string::String, vector<u8>>`,
claims_digest_to_key: `0x2::table::Table<vector<u8>, 0x1::string::String>`,
} )

export function isVC(type: Type): boolean { return type === "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::VC"; }

export interface VCFields { id: string; authenticator: string; subject: string; createdAt: bigint; claimsKeyToDigest: Table; claimsDigestToKey: Table }

export class VC { static readonly $typeName = "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::VC"; static readonly $numTypeParams = 0;

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

/* ============================== ContainsClaimEvent =============================== */

bcs.registerStructType( "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::ContainsClaimEvent", {
authenticator: `address`,
subject: `address`,
claim_key: `0x1::string::String`,
claim_digest: `vector<u8>`,
is_verified: `bool`,
} )

export function isContainsClaimEvent(type: Type): boolean { return type === "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::ContainsClaimEvent"; }

export interface ContainsClaimEventFields { authenticator: string; subject: string; claimKey: string; claimDigest: Array<number>; isVerified: boolean }

export class ContainsClaimEvent { static readonly $typeName = "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::ContainsClaimEvent"; static readonly $numTypeParams = 0;

 ; readonly authenticator: string; readonly subject: string; readonly claimKey: string; readonly claimDigest: Array<number>; readonly isVerified: boolean

 constructor( fields: ContainsClaimEventFields, ) { this.authenticator = fields.authenticator;; this.subject = fields.subject;; this.claimKey = fields.claimKey;; this.claimDigest = fields.claimDigest;; this.isVerified = fields.isVerified; }

 static fromFields( fields: Record<string, any> ): ContainsClaimEvent { return new ContainsClaimEvent( { authenticator: `0x${fields.authenticator}`, subject: `0x${fields.subject}`, claimKey: (new TextDecoder()).decode(Uint8Array.from(String.fromFields(fields.claim_key).bytes)).toString(), claimDigest: fields.claim_digest.map((item: any) => item), isVerified: fields.is_verified } ) }

 static fromFieldsWithTypes(item: FieldsWithTypes): ContainsClaimEvent { if (!isContainsClaimEvent(item.type)) { throw new Error("not a ContainsClaimEvent type");

 } return new ContainsClaimEvent( { authenticator: `0x${item.fields.authenticator}`, subject: `0x${item.fields.subject}`, claimKey: item.fields.claim_key, claimDigest: item.fields.claim_digest.map((item: any) => item), isVerified: item.fields.is_verified } ) }

 static fromBcs( data: Uint8Array | string, encoding?: Encoding ): ContainsClaimEvent { return ContainsClaimEvent.fromFields( bcs.de([ContainsClaimEvent.$typeName, ], data, encoding) ) }

 }

/* ============================== BoundCheckEvent =============================== */

bcs.registerStructType( "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::BoundCheckEvent", {
authenticator: `address`,
subject: `address`,
claim_key: `0x1::string::String`,
claim_digest: `vector<u8>`,
gte_bound: `u64`,
lt_bound: `u64`,
is_verified: `bool`,
} )

export function isBoundCheckEvent(type: Type): boolean { return type === "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::BoundCheckEvent"; }

export interface BoundCheckEventFields { authenticator: string; subject: string; claimKey: string; claimDigest: Array<number>; gteBound: bigint; ltBound: bigint; isVerified: boolean }

export class BoundCheckEvent { static readonly $typeName = "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::vc::BoundCheckEvent"; static readonly $numTypeParams = 0;

 ; readonly authenticator: string; readonly subject: string; readonly claimKey: string; readonly claimDigest: Array<number>; readonly gteBound: bigint; readonly ltBound: bigint; readonly isVerified: boolean

 constructor( fields: BoundCheckEventFields, ) { this.authenticator = fields.authenticator;; this.subject = fields.subject;; this.claimKey = fields.claimKey;; this.claimDigest = fields.claimDigest;; this.gteBound = fields.gteBound;; this.ltBound = fields.ltBound;; this.isVerified = fields.isVerified; }

 static fromFields( fields: Record<string, any> ): BoundCheckEvent { return new BoundCheckEvent( { authenticator: `0x${fields.authenticator}`, subject: `0x${fields.subject}`, claimKey: (new TextDecoder()).decode(Uint8Array.from(String.fromFields(fields.claim_key).bytes)).toString(), claimDigest: fields.claim_digest.map((item: any) => item), gteBound: BigInt(fields.gte_bound), ltBound: BigInt(fields.lt_bound), isVerified: fields.is_verified } ) }

 static fromFieldsWithTypes(item: FieldsWithTypes): BoundCheckEvent { if (!isBoundCheckEvent(item.type)) { throw new Error("not a BoundCheckEvent type");

 } return new BoundCheckEvent( { authenticator: `0x${item.fields.authenticator}`, subject: `0x${item.fields.subject}`, claimKey: item.fields.claim_key, claimDigest: item.fields.claim_digest.map((item: any) => item), gteBound: BigInt(item.fields.gte_bound), ltBound: BigInt(item.fields.lt_bound), isVerified: item.fields.is_verified } ) }

 static fromBcs( data: Uint8Array | string, encoding?: Encoding ): BoundCheckEvent { return BoundCheckEvent.fromFields( bcs.de([BoundCheckEvent.$typeName, ], data, encoding) ) }

 }