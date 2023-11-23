import {PUBLISHED_AT} from "..";
import {pure} from "../../_framework/util";
import {TransactionArgument, TransactionBlock} from "@mysten/sui.js/transactions";

export interface VerifyHashPreimageAndRangeProofArgs { vecU81: Array<number | TransactionArgument> | TransactionArgument; u641: bigint | TransactionArgument; u642: bigint | TransactionArgument; vecU82: Array<number | TransactionArgument> | TransactionArgument; vecU83: Array<number | TransactionArgument> | TransactionArgument }

export function verifyHashPreimageAndRangeProof( txb: TransactionBlock, args: VerifyHashPreimageAndRangeProofArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::verifier::verify_hash_preimage_and_range_proof`, arguments: [ pure(txb, args.vecU81, `vector<u8>`), pure(txb, args.u641, `u64`), pure(txb, args.u642, `u64`), pure(txb, args.vecU82, `vector<u8>`), pure(txb, args.vecU83, `vector<u8>`) ], }) }

export interface VerifyGroth16Bn254Args { vecU81: Array<number | TransactionArgument> | TransactionArgument; vecU82: Array<number | TransactionArgument> | TransactionArgument; vecU83: Array<number | TransactionArgument> | TransactionArgument }

export function verifyGroth16Bn254( txb: TransactionBlock, args: VerifyGroth16Bn254Args ) { return txb.moveCall({ target: `${PUBLISHED_AT}::verifier::verify_groth16_bn254`, arguments: [ pure(txb, args.vecU81, `vector<u8>`), pure(txb, args.vecU82, `vector<u8>`), pure(txb, args.vecU83, `vector<u8>`) ], }) }
