import {PUBLISHED_AT} from "..";
import {ObjectArg, obj, pure} from "../../_framework/util";
import {TransactionArgument, TransactionBlock} from "@mysten/sui.js/transactions";

export interface VerifyProofArgs { vc: ObjectArg; address: string | TransactionArgument; string: string | TransactionArgument; vecU81: Array<number | TransactionArgument> | TransactionArgument; vecU82: Array<number | TransactionArgument> | TransactionArgument; vecU83: Array<number | TransactionArgument> | TransactionArgument; vecU84: Array<number | TransactionArgument> | TransactionArgument }

export function verifyProof( txb: TransactionBlock, args: VerifyProofArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::verifier::verify_proof`, arguments: [ obj(txb, args.vc), pure(txb, args.address, `address`), pure(txb, args.string, `0x1::string::String`), pure(txb, args.vecU81, `vector<u8>`), pure(txb, args.vecU82, `vector<u8>`), pure(txb, args.vecU83, `vector<u8>`), pure(txb, args.vecU84, `vector<u8>`) ], }) }

export interface VerifyGroth16Bn254Args { vecU81: Array<number | TransactionArgument> | TransactionArgument; vecU82: Array<number | TransactionArgument> | TransactionArgument; vecU83: Array<number | TransactionArgument> | TransactionArgument }

export function verifyGroth16Bn254( txb: TransactionBlock, args: VerifyGroth16Bn254Args ) { return txb.moveCall({ target: `${PUBLISHED_AT}::verifier::verify_groth16_bn254`, arguments: [ pure(txb, args.vecU81, `vector<u8>`), pure(txb, args.vecU82, `vector<u8>`), pure(txb, args.vecU83, `vector<u8>`) ], }) }
