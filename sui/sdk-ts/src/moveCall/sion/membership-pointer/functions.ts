import { PUBLISHED_AT } from '..';
import { ObjectArg, obj, pure } from '../../_framework/util';
import { TransactionArgument, TransactionBlock } from '@mysten/sui.js/transactions';

export interface NewArgs {
  id: string | TransactionArgument;
  address1: string | TransactionArgument;
  address2: string | TransactionArgument;
}

export function new_(txb: TransactionBlock, args: NewArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_pointer::new`,
    arguments: [
      pure(txb, args.id, `0x2::object::ID`),
      pure(txb, args.address1, `address`),
      pure(txb, args.address2, `address`),
    ],
  });
}

export function membershipId(txb: TransactionBlock, membershipPointer: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_pointer::membership_id`,
    arguments: [obj(txb, membershipPointer)],
  });
}

export function authenticator(txb: TransactionBlock, membershipPointer: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_pointer::authenticator`,
    arguments: [obj(txb, membershipPointer)],
  });
}

export function subject(txb: TransactionBlock, membershipPointer: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::membership_pointer::subject`,
    arguments: [obj(txb, membershipPointer)],
  });
}
