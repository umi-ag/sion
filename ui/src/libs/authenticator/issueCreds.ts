import {
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
  getFullnodeUrl,
} from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CredentialClaim, sionClient, sionMoveCall } from 'sion-sdk';
import { authenticatorKeypair } from './config';
import { isMembership } from '../moveCall/sion/membership/structs';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

export const moveCallIssueCreds = async (args: {
  memberAddress: string;
  claimList: CredentialClaim[];
}) => {
  const membershipId = await sionClient.getOwnedMembershipObjectId(client, {
    address: args.memberAddress,
  });

  const txb = new TransactionBlock();
  sionMoveCall.insertClaims(txb, {
    membershipId,
    claimList: args.claimList,
  });

  const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: authenticatorKeypair(),
    requestType: 'WaitForLocalExecution',
    options: {
      showObjectChanges: true,
    },
  });

  return result.objectChanges?.find((obj) =>
    // @ts-ignore
    isMembership(obj?.objectType),
  ) as SuiObjectData;
};
