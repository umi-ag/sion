import {
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
  getFullnodeUrl,
} from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { sionMoveCall } from 'sion-sdk';
import { authenticatorKeypair } from './config';

const MEMBER_ADDRESS = '0x640aff861034c71ba7a71488d64152772caa4101842502fed3132deebb550077';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

const address = authenticatorKeypair().toSuiAddress();
console.log({ address });

const membershipRegistryObject = await (async () => {
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
})();

console.log({ membershipRegistryObject });

await (async () => {
  const txb = new TransactionBlock();
  sionMoveCall.insertMember(txb, {
    membershipRegistryId: membershipRegistryObject.objectId,
    memberAddress: MEMBER_ADDRESS,
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
})();
