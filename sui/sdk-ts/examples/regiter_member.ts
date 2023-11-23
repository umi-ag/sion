import {
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
  getFullnodeUrl,
} from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';
import fetch from 'cross-fetch';
import { isMembershipPointer } from '../src/moveCall/sion/membership-pointer/structs';
import { create, insertMember } from '../src/moveCall/sion/membership-registry/functions';
import { isMembershipRegistry } from '../src/moveCall/sion/membership-registry/structs';
import { isMembership } from '../src/moveCall/sion/membership/structs';

globalThis.fetch = fetch;

const MEMBER_ADDRESS = '0x640aff861034c71ba7a71488d64152772caa4101842502fed3132deebb550077';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

const keypair = () => {
  const privatekeyHex = (process.env.SUI_PRIVATE_KEY as string).replace(/^0x/, '');
  const privateKey = Buffer.from(privatekeyHex, 'hex');
  return Ed25519Keypair.fromSecretKey(privateKey);

  // const mnemonic = process.env.SUI_MNEMONIC as string;
  // return Ed25519Keypair.deriveKeypair(mnemonic);
};

const address = keypair().toSuiAddress();
console.log({ address });

const membershipRegistryObject = await (async () => {
  const txb = new TransactionBlock();
  create(txb);
  const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: keypair(),
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
  insertMember(txb, {
    membershipRegistry: membershipRegistryObject.objectId,
    address: MEMBER_ADDRESS,
    clock: SUI_CLOCK_OBJECT_ID,
  });
  const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: keypair(),
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
