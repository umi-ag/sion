import {PUBLISHED_AT} from "..";
import {ObjectArg, obj, pure} from "../../_framework/util";
import {TransactionArgument, TransactionBlock} from "@mysten/sui.js/transactions";

export function new_( txb: TransactionBlock, clock: ObjectArg ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::new`, arguments: [ obj(txb, clock) ], }) }

export function create( txb: TransactionBlock, clock: ObjectArg ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::create`, arguments: [ obj(txb, clock) ], }) }

export function createdBy( txb: TransactionBlock, vc: ObjectArg ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::created_by`, arguments: [ obj(txb, vc) ], }) }

export interface AddFieldArgs { vc: ObjectArg; string: string | TransactionArgument; vecU8: Array<number | TransactionArgument> | TransactionArgument }

export function addField( txb: TransactionBlock, args: AddFieldArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::add_field`, arguments: [ obj(txb, args.vc), pure(txb, args.string, `0x1::string::String`), pure(txb, args.vecU8, `vector<u8>`) ], }) }

export interface GetFieldArgs { vc: ObjectArg; string: string | TransactionArgument }

export function getField( txb: TransactionBlock, args: GetFieldArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::get_field`, arguments: [ obj(txb, args.vc), pure(txb, args.string, `0x1::string::String`) ], }) }

export interface UpdateFieldArgs { vc: ObjectArg; string: string | TransactionArgument; vecU8: Array<number | TransactionArgument> | TransactionArgument }

export function updateField( txb: TransactionBlock, args: UpdateFieldArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::update_field`, arguments: [ obj(txb, args.vc), pure(txb, args.string, `0x1::string::String`), pure(txb, args.vecU8, `vector<u8>`) ], }) }
