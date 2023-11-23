import {bcsOnchain as bcs} from "../../_framework/bcs";
import {FieldsWithTypes, Type} from "../../_framework/util";
import {Encoding} from "@mysten/bcs";

/* ============================== PublicInputsArgs =============================== */

bcs.registerStructType( "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::public_inputs::PublicInputsArgs", {
expected_digest: `vector<u8>`,
min: `u64`,
max: `u64`,
} )

export function isPublicInputsArgs(type: Type): boolean { return type === "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::public_inputs::PublicInputsArgs"; }

export interface PublicInputsArgsFields { expectedDigest: Array<number>; min: bigint; max: bigint }

export class PublicInputsArgs { static readonly $typeName = "0x30bb7d0231b0fd195b14761cdc292912634b632914c367c7a85f4b7a98330725::public_inputs::PublicInputsArgs"; static readonly $numTypeParams = 0;

 ; readonly expectedDigest: Array<number>; readonly min: bigint; readonly max: bigint

 constructor( fields: PublicInputsArgsFields, ) { this.expectedDigest = fields.expectedDigest;; this.min = fields.min;; this.max = fields.max; }

 static fromFields( fields: Record<string, any> ): PublicInputsArgs { return new PublicInputsArgs( { expectedDigest: fields.expected_digest.map((item: any) => item), min: BigInt(fields.min), max: BigInt(fields.max) } ) }

 static fromFieldsWithTypes(item: FieldsWithTypes): PublicInputsArgs { if (!isPublicInputsArgs(item.type)) { throw new Error("not a PublicInputsArgs type");

 } return new PublicInputsArgs( { expectedDigest: item.fields.expected_digest.map((item: any) => item), min: BigInt(item.fields.min), max: BigInt(item.fields.max) } ) }

 static fromBcs( data: Uint8Array | string, encoding?: Encoding ): PublicInputsArgs { return PublicInputsArgs.fromFields( bcs.de([PublicInputsArgs.$typeName, ], data, encoding) ) }

 }
