import { PUBLISHED_AT } from '..';
import { GenericArg, ObjectArg, Type, generic, obj, pure } from '../../_framework/util';
import { TransactionArgument, TransactionBlock } from '@mysten/sui.js/transactions';

export interface NewArgs {
  vecU8: Array<number | TransactionArgument> | TransactionArgument;
  u641: bigint | TransactionArgument;
  u642: bigint | TransactionArgument;
}

export function new_(txb: TransactionBlock, args: NewArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::public_inputs::new`,
    arguments: [
      pure(txb, args.vecU8, `vector<u8>`),
      pure(txb, args.u641, `u64`),
      pure(txb, args.u642, `u64`),
    ],
  });
}

export function toBytes(txb: TransactionBlock, publicInputsArgs: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::public_inputs::to_bytes`,
    arguments: [obj(txb, publicInputsArgs)],
  });
}

export interface BuildPublicInputsBytesArgs {
  vecU8: Array<number | TransactionArgument> | TransactionArgument;
  u641: bigint | TransactionArgument;
  u642: bigint | TransactionArgument;
}

export function buildPublicInputsBytes(txb: TransactionBlock, args: BuildPublicInputsBytesArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::public_inputs::build_public_inputs_bytes`,
    arguments: [
      pure(txb, args.vecU8, `vector<u8>`),
      pure(txb, args.u641, `u64`),
      pure(txb, args.u642, `u64`),
    ],
  });
}

export function toLeBytes(txb: TransactionBlock, typeArg: Type, t0: GenericArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::public_inputs::to_le_bytes`,
    typeArguments: [typeArg],
    arguments: [generic(txb, `${typeArg}`, t0)],
  });
}
