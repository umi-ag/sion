import {
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
  getFullnodeUrl,
} from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { sionMoveCall } from 'sion-sdk';
import { MEMBERSHIP_REGISTRY_OBJECT_ID, authenticatorKeypair } from './config';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

const address = authenticatorKeypair().toSuiAddress();
console.log({ address });

export const moveCallMembershipRegistryObject = async () => {
  const txb = new TransactionBlock();
  sionMoveCall.createMembershipRegister(txb);
  const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: authenticatorKeypair(),
    requestType: 'WaitForLocalExecution',
    options: {
      showObjectChanges: true,
    },
  });

  console.log(result);

  const membershipRegistryObject = result.objectChanges?.find(
    // @ts-ignore
    (obj) => isMembershipRegistry(obj?.objectType),
  );

  return membershipRegistryObject as SuiObjectData;
};

export const moveCallInsertMember = async (args: {
  memberAddress: string;
}) => {
  const txb = new TransactionBlock();

  sionMoveCall.insertMember(txb, {
    membershipRegistryId: MEMBERSHIP_REGISTRY_OBJECT_ID,
    memberAddress: args.memberAddress,
  });

  const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: authenticatorKeypair(),
    requestType: 'WaitForLocalExecution',
    options: {
      showObjectChanges: true,
    },
  });

  const membership = result.objectChanges?.find(
    // @ts-ignore
    (obj) => isMembership(obj?.objectType),
  );

  console.log({ membership });

  const membershipPointer = result.objectChanges?.find(
    // @ts-ignore
    (obj) => isMembershipPointer(obj?.objectType),
  );
  console.log({ membershipPointer });
};
