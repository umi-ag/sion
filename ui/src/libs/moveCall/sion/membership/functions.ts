import { PUBLISHED_AT } from '..';
import { ObjectArg, obj, pure } from '../../_framework/util';
import { TransactionArgument, TransactionBlock } from '@mysten/sui.js/transactions';

export interface NewArgs {
  address1: string | TransactionArgument;
  address2: string | TransactionArgument;
  clock: ObjectArg;
}

export function new_(txb: TransactionBlock, args: NewArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::new`,
    arguments: [
      pure(txb, args.address1, `address`),
      pure(txb, args.address2, `address`),
      obj(txb, args.clock),
    ],
  });
}

export function authenticator(txb: TransactionBlock, membership: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::authenticator`,
    arguments: [obj(txb, membership)],
  });
}

export function subject(txb: TransactionBlock, membership: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::subject`,
    arguments: [obj(txb, membership)],
  });
}

export interface InsertClaimArgs {
  membership: ObjectArg;
  string: string | TransactionArgument;
  vecU8: Array<number | TransactionArgument> | TransactionArgument;
}

export function insertClaim(txb: TransactionBlock, args: InsertClaimArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::insert_claim`,
    arguments: [
      obj(txb, args.membership),
      pure(txb, args.string, `0x1::string::String`),
      pure(txb, args.vecU8, `vector<u8>`),
    ],
  });
}

export interface InsertClaimKeyToDigestArgs {
  membership: ObjectArg;
  string: string | TransactionArgument;
  vecU8: Array<number | TransactionArgument> | TransactionArgument;
}

export function insertClaimKeyToDigest(txb: TransactionBlock, args: InsertClaimKeyToDigestArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::insert_claim_key_to_digest`,
    arguments: [
      obj(txb, args.membership),
      pure(txb, args.string, `0x1::string::String`),
      pure(txb, args.vecU8, `vector<u8>`),
    ],
  });
}

export interface InsertClaimDigestToKeyArgs {
  membership: ObjectArg;
  string: string | TransactionArgument;
  vecU8: Array<number | TransactionArgument> | TransactionArgument;
}

export function insertClaimDigestToKey(txb: TransactionBlock, args: InsertClaimDigestToKeyArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::insert_claim_digest_to_key`,
    arguments: [
      obj(txb, args.membership),
      pure(txb, args.string, `0x1::string::String`),
      pure(txb, args.vecU8, `vector<u8>`),
    ],
  });
}

export interface RemoveClaimArgs {
  membership: ObjectArg;
  string: string | TransactionArgument;
}

export function removeClaim(txb: TransactionBlock, args: RemoveClaimArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::remove_claim`,
    arguments: [obj(txb, args.membership), pure(txb, args.string, `0x1::string::String`)],
  });
}

export interface BorrowClaimDigestByKeyArgs {
  membership: ObjectArg;
  string: string | TransactionArgument;
}

export function borrowClaimDigestByKey(txb: TransactionBlock, args: BorrowClaimDigestByKeyArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::borrow_claim_digest_by_key`,
    arguments: [obj(txb, args.membership), pure(txb, args.string, `0x1::string::String`)],
  });
}

export interface BorrowClaimKeyByDigestArgs {
  membership: ObjectArg;
  vecU8: Array<number | TransactionArgument> | TransactionArgument;
}

export function borrowClaimKeyByDigest(txb: TransactionBlock, args: BorrowClaimKeyByDigestArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::borrow_claim_key_by_digest`,
    arguments: [obj(txb, args.membership), pure(txb, args.vecU8, `vector<u8>`)],
  });
}

export interface ContainsClaimKeyArgs {
  membership: ObjectArg;
  string: string | TransactionArgument;
}

export function containsClaimKey(txb: TransactionBlock, args: ContainsClaimKeyArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::contains_claim_key`,
    arguments: [obj(txb, args.membership), pure(txb, args.string, `0x1::string::String`)],
  });
}

export interface ContainsClaimDigestArgs {
  membership: ObjectArg;
  vecU8: Array<number | TransactionArgument> | TransactionArgument;
}

export function containsClaimDigest(txb: TransactionBlock, args: ContainsClaimDigestArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::contains_claim_digest`,
    arguments: [obj(txb, args.membership), pure(txb, args.vecU8, `vector<u8>`)],
  });
}

export function lengthClaims(txb: TransactionBlock, membership: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::length_claims`,
    arguments: [obj(txb, membership)],
  });
}

export function isEmptyClaims(txb: TransactionBlock, membership: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::is_empty_claims`,
    arguments: [obj(txb, membership)],
  });
}

export interface BoundCheckArgs {
  membership: ObjectArg;
  string: string | TransactionArgument;
  u641: bigint | TransactionArgument;
  u642: bigint | TransactionArgument;
  vecU81: Array<number | TransactionArgument> | TransactionArgument;
  vecU82: Array<number | TransactionArgument> | TransactionArgument;
}

export function boundCheck(txb: TransactionBlock, args: BoundCheckArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership::bound_check`,
    arguments: [
      obj(txb, args.membership),
      pure(txb, args.string, `0x1::string::String`),
      pure(txb, args.u641, `u64`),
      pure(txb, args.u642, `u64`),
      pure(txb, args.vecU81, `vector<u8>`),
      pure(txb, args.vecU82, `vector<u8>`),
    ],
  });
}
