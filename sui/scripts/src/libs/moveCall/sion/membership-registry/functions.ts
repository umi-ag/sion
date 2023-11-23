import {PUBLISHED_AT} from "..";
import {ObjectArg, obj, pure} from "../../_framework/util";
import {TransactionArgument, TransactionBlock} from "@mysten/sui.js/transactions";

export function new_( txb: TransactionBlock, address: string | TransactionArgument ) { return txb.moveCall({ target: `${PUBLISHED_AT}::membership_registry::new`, arguments: [ pure(txb, address, `address`) ], }) }

export function create( txb: TransactionBlock, ) { return txb.moveCall({ target: `${PUBLISHED_AT}::membership_registry::create`, arguments: [ ], }) }

export interface RegisterMemberArgs { membershipRegistry: ObjectArg; address: string | TransactionArgument; clock: ObjectArg }

export function registerMember( txb: TransactionBlock, args: RegisterMemberArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::membership_registry::register_member`, arguments: [ obj(txb, args.membershipRegistry), pure(txb, args.address, `address`), obj(txb, args.clock) ], }) }
