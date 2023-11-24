import {PUBLISHED_AT} from "..";
import {ObjectArg, obj, pure} from "../../_framework/util";
import {TransactionArgument, TransactionBlock} from "@mysten/sui.js/transactions";

export interface NewArgs { string: string | TransactionArgument; u641: bigint | TransactionArgument; u642: bigint | TransactionArgument; clock: ObjectArg }

export function new_( txb: TransactionBlock, args: NewArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::issuer_old::new`, arguments: [ pure(txb, args.string, `0x1::string::String`), pure(txb, args.u641, `u64`), pure(txb, args.u642, `u64`), obj(txb, args.clock) ], }) }

export interface UpdateArgs { vc: ObjectArg; u641: bigint | TransactionArgument; u642: bigint | TransactionArgument }

export function update( txb: TransactionBlock, args: UpdateArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::issuer_old::update`, arguments: [ obj(txb, args.vc), pure(txb, args.u641, `u64`), pure(txb, args.u642, `u64`) ], }) }

export interface CreateArgs { string: string | TransactionArgument; u641: bigint | TransactionArgument; u642: bigint | TransactionArgument; clock: ObjectArg }

export function create( txb: TransactionBlock, args: CreateArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::issuer_old::create`, arguments: [ pure(txb, args.string, `0x1::string::String`), pure(txb, args.u641, `u64`), pure(txb, args.u642, `u64`), obj(txb, args.clock) ], }) }
