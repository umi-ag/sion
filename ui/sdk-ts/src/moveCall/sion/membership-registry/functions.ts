import { PUBLISHED_AT } from '..';
import { ObjectArg, obj, pure } from '../../_framework/util';
import { TransactionArgument, TransactionBlock } from '@mysten/sui.js/transactions';

export function new_(txb: TransactionBlock, address: string | TransactionArgument) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_registry::new`,
    arguments: [pure(txb, address, `address`)],
  });
}

export function create(txb: TransactionBlock) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_registry::create`,
    arguments: [],
  });
}

export interface GetMembershipIdArgs {
  membershipRegistry: ObjectArg;
  address: string | TransactionArgument;
}

export function getMembershipId(txb: TransactionBlock, args: GetMembershipIdArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_registry::get_membership_id`,
    arguments: [obj(txb, args.membershipRegistry), pure(txb, args.address, `address`)],
  });
}

export interface InsertMemberArgs {
  membershipRegistry: ObjectArg;
  address: string | TransactionArgument;
  clock: ObjectArg;
}

export function insertMember(txb: TransactionBlock, args: InsertMemberArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_registry::insert_member`,
    arguments: [
      obj(txb, args.membershipRegistry),
      pure(txb, args.address, `address`),
      obj(txb, args.clock),
    ],
  });
}

export interface InsertMemberInnerArgs {
  membershipRegistry: ObjectArg;
  address: string | TransactionArgument;
  clock: ObjectArg;
}

export function insertMemberInner(txb: TransactionBlock, args: InsertMemberInnerArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_registry::insert_member_inner`,
    arguments: [
      obj(txb, args.membershipRegistry),
      pure(txb, args.address, `address`),
      obj(txb, args.clock),
    ],
  });
}

export interface ContainsMemberArgs {
  membershipRegistry: ObjectArg;
  address: string | TransactionArgument;
}

export function containsMember(txb: TransactionBlock, args: ContainsMemberArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_registry::contains_member`,
    arguments: [obj(txb, args.membershipRegistry), pure(txb, args.address, `address`)],
  });
}
