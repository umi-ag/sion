import { TransactionBlock } from '@mysten/sui.js/dist/cjs/builder';
import { u64ToSha256Digest } from './bytes';
import {
  boundCheck,
  containsClaimDigest,
  insertClaim,
} from '../moveCall/sion/membership/functions';
import { CredentialClaim } from './types';
import { create, insertMember } from '../moveCall/sion/membership-registry/functions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

export const sionMoveCall = {
  createMembershipRegister: async (txb: TransactionBlock) => {
    create(txb);
  },

  insertMember: async (
    txb: TransactionBlock,
    args: {
      membershipRegistryId: string;
      memberAddress: string;
    },
  ) => {
    insertMember(txb, {
      membershipRegistry: args.membershipRegistryId,
      address: args.memberAddress,
      clock: SUI_CLOCK_OBJECT_ID,
    });
  },

  insertClaims: async (
    txb: TransactionBlock,
    args: {
      membershipId: string;
      claimList: CredentialClaim[];
    },
  ) => {
    for (const claim of args.claimList) {
      const digest = u64ToSha256Digest(claim.value);

      insertClaim(txb, {
        membership: args.membershipId,
        string: claim.key,
        vecU8: Array.from(Buffer.from(digest, 'hex')),
      });
    }
  },

  verifyClaimDigest: async (
    txb: TransactionBlock,
    args: {
      membershipId: string;
      claimValueList: bigint[];
    },
  ) => {
    for (const value of args.claimValueList) {
      const digest = u64ToSha256Digest(value);

      containsClaimDigest(txb, {
        membership: args.membershipId,
        vecU8: Array.from(Buffer.from(digest, 'hex')),
      });
    }
  },

  boundCheck: async (
    txb: TransactionBlock,
    args: {
      membershipId: string;
      claimKey: string;
      lower_bound_gte: bigint;
      upper_bound_le: bigint;
      proof: Buffer;
      vk: Buffer;
    },
  ) => {
    boundCheck(txb, {
      membership: args.membershipId,
      string: args.claimKey,
      u641: args.lower_bound_gte,
      u642: args.upper_bound_le,
      vecU81: Array.from(args.proof),
      vecU82: Array.from(args.vk),
    });
  },
};
