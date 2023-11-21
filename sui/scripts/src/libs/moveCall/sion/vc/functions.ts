import {PUBLISHED_AT} from "..";
import {ObjectArg, obj, pure} from "../../_framework/util";
import {TransactionArgument, TransactionBlock} from "@mysten/sui.js/transactions";

export interface NewArgs { address1: string | TransactionArgument; address2: string | TransactionArgument; clock: ObjectArg }

export function new_( txb: TransactionBlock, args: NewArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::new`, arguments: [ pure(txb, args.address1, `address`), pure(txb, args.address2, `address`), obj(txb, args.clock) ], }) }

export function authenticator( txb: TransactionBlock, vc: ObjectArg ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::authenticator`, arguments: [ obj(txb, vc) ], }) }

export function subject( txb: TransactionBlock, vc: ObjectArg ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::subject`, arguments: [ obj(txb, vc) ], }) }

export interface InseartClaimArgs { vc: ObjectArg; string: string | TransactionArgument; vecU8: Array<number | TransactionArgument> | TransactionArgument }

export function inseartClaim( txb: TransactionBlock, args: InseartClaimArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::inseart_claim`, arguments: [ obj(txb, args.vc), pure(txb, args.string, `0x1::string::String`), pure(txb, args.vecU8, `vector<u8>`) ], }) }

export interface InseartClaimKeyToDigestArgs { vc: ObjectArg; string: string | TransactionArgument; vecU8: Array<number | TransactionArgument> | TransactionArgument }

export function inseartClaimKeyToDigest( txb: TransactionBlock, args: InseartClaimKeyToDigestArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::inseart_claim_key_to_digest`, arguments: [ obj(txb, args.vc), pure(txb, args.string, `0x1::string::String`), pure(txb, args.vecU8, `vector<u8>`) ], }) }

export interface InseartClaimDigestToKeyArgs { vc: ObjectArg; string: string | TransactionArgument; vecU8: Array<number | TransactionArgument> | TransactionArgument }

export function inseartClaimDigestToKey( txb: TransactionBlock, args: InseartClaimDigestToKeyArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::inseart_claim_digest_to_key`, arguments: [ obj(txb, args.vc), pure(txb, args.string, `0x1::string::String`), pure(txb, args.vecU8, `vector<u8>`) ], }) }

export interface RemoveClaimArgs { vc: ObjectArg; string: string | TransactionArgument }

export function removeClaim( txb: TransactionBlock, args: RemoveClaimArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::remove_claim`, arguments: [ obj(txb, args.vc), pure(txb, args.string, `0x1::string::String`) ], }) }

export interface ContainsClaimKeyArgs { vc: ObjectArg; string: string | TransactionArgument }

export function containsClaimKey( txb: TransactionBlock, args: ContainsClaimKeyArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::contains_claim_key`, arguments: [ obj(txb, args.vc), pure(txb, args.string, `0x1::string::String`) ], }) }

export interface ContainsClaimDigestArgs { vc: ObjectArg; vecU8: Array<number | TransactionArgument> | TransactionArgument }

export function containsClaimDigest( txb: TransactionBlock, args: ContainsClaimDigestArgs ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::contains_claim_digest`, arguments: [ obj(txb, args.vc), pure(txb, args.vecU8, `vector<u8>`) ], }) }

export function lengthClaims( txb: TransactionBlock, vc: ObjectArg ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::length_claims`, arguments: [ obj(txb, vc) ], }) }

export function isEmptyClaims( txb: TransactionBlock, vc: ObjectArg ) { return txb.moveCall({ target: `${PUBLISHED_AT}::vc::is_empty_claims`, arguments: [ obj(txb, vc) ], }) }
